import { Neovim } from '@chemzqm/neovim'
import debounce from 'debounce'
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver-protocol'
import Document from '../model/document'
import { DiagnosticInfo } from '../types'
import { byteIndex, byteLength } from '../util/string'
import workspace from '../workspace'
import { DiagnosticManager } from './manager'
const logger = require('../util/logger')('diagnostic-buffer')

const severityNames = ['CocError', 'CocWarning', 'CocInfo', 'CocHint']

function getNameFromSeverity(severity: DiagnosticSeverity): string {
  switch (severity) {
    case DiagnosticSeverity.Error:
      return 'CocError'
    case DiagnosticSeverity.Warning:
      return 'CocWarning'
    case DiagnosticSeverity.Information:
      return 'CocInfo'
    case DiagnosticSeverity.Hint:
      return 'CocHint'
    default:
      return 'CocError'
  }
}

function getDiagnosticInfo(diagnostics: Diagnostic[]): DiagnosticInfo {
  let error = 0
  let warning = 0
  let information = 0
  let hint = 0
  if (diagnostics && diagnostics.length) {
    for (let diagnostic of diagnostics) {
      switch (diagnostic.severity) {
        case DiagnosticSeverity.Error:
          error = error + 1
          break
        case DiagnosticSeverity.Warning:
          warning = warning + 1
          break
        case DiagnosticSeverity.Information:
          information = information + 1
          break
        case DiagnosticSeverity.Hint:
          hint = hint + 1
          break
        default:
          error = error + 1
      }
    }
  }
  return { error, warning, information, hint }
}

// maintains sign and highlightId
export class DiagnosticBuffer {
  private signMap: Map<string, number[]> = new Map()
  private srcIdMap: Map<string, Set<number>> = new Map()
  private infoMap: Map<string, DiagnosticInfo> = new Map()
  private nvim: Neovim
  private signId: number
  private promise: Promise<void | void[]> = Promise.resolve(null)
  public setLocationlist: Function & { clear: () => void }

  constructor(public readonly uri: string, private manager: DiagnosticManager) {
    this.nvim = workspace.nvim
    this.signId = manager.config.signOffset || 1000
    this.setLocationlist = debounce(() => {
      this._setLocationlist().catch(e => {
        logger.error(e.stack)
      })
    }, 200)
  }

  private enableLoclist(): boolean {
    return this.manager.config.locationlist
  }

  public set(owner: string, diagnostics: Diagnostic[] | null): void {
    this.promise = this.promise.then(() => {
      return this._set(owner, diagnostics)
    }, err => {
      logger.error(err.message)
    })
  }

  public async resetLocationlist(): Promise<void> {
    let ids = await this.getWinids()
    let { nvim } = this
    for (let winid of ids) {
      let curr = await nvim.call('getloclist', [winid, { title: 1 }])
      if (curr.title && curr.title.indexOf('Diagnostics of coc') != -1) {
        nvim.call('setloclist', [winid, [], 'f'], true)
      }
    }
  }

  private async _setLocationlist(): Promise<void> {
    if (!this.enableLoclist) return
    let { nvim, document } = this
    if (!document) return
    let { bufnr, uri } = document
    let ids = await this.getWinids()
    let items = this.manager.getLocationList(uri, bufnr)
    for (let winid of ids) {
      let curr = await nvim.call('getloclist', [winid, { title: 1 }])
      let action = (curr.title && curr.title.indexOf('Diagnostics of coc') != -1) ? 'r' : ' '
      await nvim.call('setloclist', [winid, items, action, 'Diagnostics of coc'])
    }
  }

  private async getWinids(): Promise<number[]> {
    let { nvim, document } = this
    let { bufnr } = document
    let res: number[] = []
    let wins = await nvim.windows
    for (let win of wins) {
      try {
        let buf = await win.buffer
        if (buf.id == bufnr) {
          res.push(win.id)
        }
      } catch (e) {
        // noop
      }
    }
    return res
  }

  private async _set(owner: string, diagnostics: Diagnostic[] | null): Promise<void> {
    let { document } = this
    if (!document) return
    try {
      this.setLocationlist()
      await this._clear(owner)
      this.infoMap.set(owner, getDiagnosticInfo(diagnostics))
      this.setDiagnosticInfo()
      if (diagnostics && diagnostics.length != 0) {
        diagnostics.sort((a, b) => b.severity - a.severity)
        let signIds = this.getSignIds(owner, diagnostics.length)
        diagnostics.map((diagnostic, i) => {
          let line = diagnostic.range.start.line
          let signId = signIds[i]
          this.addSign(signId, line, diagnostic.severity)
          if (workspace.isVim) {
            this.addHighlight(owner, diagnostic.range, diagnostic.severity).catch(e => {
              logger.error(e.message)
            })
          } else {
            this.addHighlightNvim(owner, diagnostic.range, diagnostic.severity)
          }
        })
      }
    } catch (e) {
      logger.error(e.stack)
    }
  }

  private addHighlightNvim(owner: string, range: Range, severity: DiagnosticSeverity): void {
    let srcId = this.manager.getSrcId(owner)
    let { start, end } = range
    let { document } = this
    if (!document || !srcId) return
    let { buffer } = document
    for (let i = start.line; i <= end.line; i++) {
      let line = document.getline(i)
      if (!line || !line.length) continue
      let s = i == start.line ? start.character : 0
      let e = i == end.line ? end.character : -1
      buffer.addHighlight({
        srcId,
        hlGroup: getNameFromSeverity(severity) + 'Highlight',
        line: i,
        colStart: s == 0 ? 0 : byteIndex(line, s),
        colEnd: e == -1 ? -1 : byteIndex(line, e),
      }).catch(e => {
        logger.error(e.message)
      })
    }
  }

  public async clearSigns(): Promise<void> {
    let { document, signs } = this
    if (!document) return
    let { buffer } = document
    let content = await this.nvim.call('execute', [`sign place buffer=${buffer.id}`])
    let lines: string[] = content.split('\n')
    let ids = []
    for (let line of lines) {
      let ms = line.match(/^\s*line=\d+\s+id=(\d+)\s+name=(\w+)/)
      if (!ms) continue
      let [, id, name] = ms
      if (severityNames.indexOf(name) != -1 && signs.indexOf(Number(id)) == -1) {
        ids.push(id)
      }
    }
    this.nvim.call('coc#util#unplace_signs', [buffer.id, ids], true)
  }

  private get signs(): number[] {
    let res: number[] = []
    for (let [, signs] of this.signMap) {
      res.push(...signs)
    }
    return res
  }

  private async _clear(owner: string): Promise<void> {
    let { document, nvim } = this
    if (!document) return
    let signIds = this.signMap.get(owner) || []
    try {
      await this.clearHighlight(owner)
      await nvim.call('coc#util#unplace_signs', [document.bufnr, signIds])
      this.signMap.set(owner, [])
      this.infoMap.delete(owner)
    } catch (e) {
      logger.error(e.stack)
    }
  }

  private async _clearAll(): Promise<void> {
    let { document, nvim } = this
    let names = Array.from(this.signMap.keys())
    let signIds = []
    for (let name of names) {
      let ids = this.signMap.get(name) || []
      signIds.push(...ids)
    }
    if (signIds.length) {
      await nvim.call('coc#util#unplace_signs', [document.bufnr, signIds])
    }
    await Promise.all(names.map(name => {
      return this.clearHighlight(name)
    }))
    this.signMap.clear()
    this.infoMap.clear()
    this.setDiagnosticInfo()
  }

  public clear(owner?: string): Promise<any> {
    this.setLocationlist.clear()
    if (!owner) {
      this.resetLocationlist().catch(e => {
        logger.error(e)
      })
      this.promise = this.promise.then(() => {
        return this._clearAll() as any
      })
    } else {
      this.promise = this.promise.then(() => {
        return this._clear(owner) as any
      })
    }
    return this.promise
  }

  private addSign(signId: number, line: number, severity: DiagnosticSeverity): void {
    let { document, nvim } = this
    if (!document) return
    let { buffer } = document
    let name = getNameFromSeverity(severity)
    nvim.command(`sign place ${signId} line=${line + 1} name=${name} buffer=${buffer.id}`, true)
  }

  private setDiagnosticInfo(): void {
    let { document } = this
    if (!document) return
    let { buffer } = document
    let error = 0
    let warning = 0
    let information = 0
    let hint = 0
    for (let [, diagnosticInfo] of this.infoMap) {
      if (!diagnosticInfo) continue
      error = error + diagnosticInfo.error
      warning = warning + diagnosticInfo.warning
      information = information + diagnosticInfo.information
      hint = hint + diagnosticInfo.hint
    }
    buffer.setVar('coc_diagnostic_info', { error, warning, information, hint }, true)
  }

  private async addHighlight(owner: string, range: Range, severity: DiagnosticSeverity): Promise<void> {
    let { start, end } = range
    let { document, srcIdMap } = this
    if (!document) return
    try {
      let list: any[] = []
      for (let i = start.line; i <= end.line; i++) {
        let line = document.getline(i)
        if (!line || !line.length) continue
        if (list.length == 8) break
        if (i == start.line && i == end.line) {
          let s = byteIndex(line, start.character) + 1
          let e = byteIndex(line, end.character) + 1
          list.push([i + 1, s, e - s])
        } else if (i == start.line) {
          let s = byteIndex(line, start.character) + 1
          let l = byteLength(line)
          list.push([i + 1, s, l - s + 1])
        } else if (i == end.line) {
          let e = byteIndex(line, end.character) + 1
          list.push([i + 1, 0, e])
        } else {
          list.push(i + 1)
        }
      }
      if (workspace.bufnr != document.bufnr) return
      let id = await workspace.nvim.call('matchaddpos', [getNameFromSeverity(severity) + 'highlight', list, 99])
      let ids = srcIdMap.get(owner)
      if (ids) {
        ids.add(id)
      } else {
        srcIdMap.set(owner, new Set([id]))
      }
    } catch (e) {
      logger.error(e.stack)
    }
  }

  private async clearHighlight(owner: string): Promise<void> {
    let { document, nvim } = this
    if (workspace.isNvim) {
      let srcId = this.manager.getSrcId(owner)
      if (srcId) document.buffer.clearHighlight({ srcId })
    } else {
      let ids = this.srcIdMap.get(owner) || new Set()
      this.srcIdMap.set(owner, new Set())
      if (!document || workspace.bufnr != document.bufnr) return
      await nvim.call('coc#util#matchdelete', [Array.from(ids)])
    }
  }

  private get document(): Document {
    return workspace.getDocument(this.uri)
  }

  private getSignIds(owner: string, len: number): number[] {
    let { signId } = this
    let res: number[] = []
    for (let i = 1; i <= len; i++) {
      res.push(signId + i)
    }
    this.signId = signId + len
    this.signMap.set(owner, res)
    return res
  }
}
