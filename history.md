# 2018-09-24

- **break change**: use `CursorMove` instead of `CursorHold` for diagnostic
  message.
- **break change**: direct move to diagnostic position would show diagnostic
  message without truncate.
- **break change**: snippet would be canceled when mode changed to normal, no
  mapping of `<esc>` any more.
- Add format document on `insertLeave` when `onTypeFormat` is supported.
- Add buffer operations on resource edit.
- Add `uninstall` action for `Denite coc-extension`.
- Fix active extension on command not working.
- Fix delete file from resource edit not works.

# 2018-09-20

- Fix diagnostic check next offset for diagnostics.
- Add `<Plug>(coc-diagnostic-info)` for show diagnostic message without
  truncate.

# 2018-09-15

- Fix wrong configuration on update.
- Fix install command with tag version.
- Fix using of unsafe `new Buffer`.
- Add support of trace format & resource operations.
- Add support of json validation for extension.
- Add support of format on save by `coc.preferences.formatOnSaveFiletypes`

# 2018-09-10

- Add `Denite coc-extension` for manage extensions.
- Add actions for manage extension including `toggleExtension` `reloadExtension`
  `deactivateExtension`
- Add check for extension update everyday.
- Fix extensions using same process of coc itself.
- Fix `configurationSection` should be null if none was specified.

# 2018-09-07

- **Break change**: all extension all seperated from core, checkout
  [Using coc extension](https://github.com/neoclide/coc.nvim/wiki/Using-coc-extensions)
- Fix `textDocumentSync` option not work when received as object.
- Fix wrong diagnostic info when using multiple lint servers.
- Use `CursorHold` for show diagnostic message.
- Add option `coc.preferences.enableMessage` to disable showing of diagnostic
  message.
- Add new events module for receive vim events.
- Add support for `prepareRename`.
- Add support for `CodeActionOptions`

# 2018-08-30

- Fix wrong `triggerKind` from VSCode.
- Add `<Plug>(coc-openlink)` for open link.
- Add `typescript.jsx` as valid typescript type.

# 2018-08-23

- Fix sometimes client status invalid.
- Add multiply provider support for all features.
- Add `documentLink` support
- Add `documentHighlight` support
- Add `foldingRange` support
- Add support of `documentSelector` same as VSCode

# 2018-08-21

- Fix diagnostic and arguments of tsserver.
- Add `keepfocus` option for `open_terminal`.
- Improve error catch of autocmds.
- Add `onTypeFormat` feature for language server
- Add `onTypeFormat` support for tsserver.
- Refactor and more tests of workspace.
- Fix `window/showMessageRequest` request.
- Use `callAsync` for async request to vim.
- Add `CocActionAsync` function send async request to server.

# 2018-08-17

- Fix exists terminal buffer not watched.
- Fix buffer not attached after `edit!`.
- Fix clean diagnostics of `tsserver.watchBuild` command.
- Fix refresh of buffer.
- Fix document not found on `BufEnter`.

  Use `rpcrequest` for `BufCreate`

- Fix no permission of log file.

  Disable create log file for root user.

- Add more command for tsserver:

  - `tsserver.reloadProjects`
  - `tsserver.openTsServerLog`
  - `tsserver.goToProjectConfig`
  - `tsserver.restart`

- Add test for workspace.

# 2018-08-16

- Improved for tsserver:

  - Add `watchBuild` command for build current project with watch in terminal.
  - Support of untitled buffer
  - Support `projectRootPath`

- Fix detach error of document.
- Fix trigger characters not works for some source.
- Fix document possible not sync before save.
- Fix denite errors with 0 as result.
- Fix wrong arguments of tsserver refactor command.
- Use `drop` for workspace `openResource`.
- Add clear coc signs on `:CocRestart`.
- **Break change** all buffer types except `nofile` `help` and `quickfix` are
  watched for changes.

# 2018-08-15

- Fix filter of completion items on fast input.
- Fix sometimes fails of include & neosnippet source.
- Fix sometimes fails to find global modules.
- Improve complete source initialization.

  - Always respect change of configuration.

- Add ability to start standalone coc service for debugging.

  - Use `NVIM_LISTEN_ADDRESS=/tmp/nvim nvim` to start
    neovim.
  - Start coc server by command like `node bin/server.js`

- Add ability to recover from unload buffer.

  Sometimes `bufReadPost` `BufEnter` could be not be fired on buffer create,
  check buffer on `CursorHold` and `TextChanged` to fix this issue.

- Add tsserver features: `tsserver.formatOnSave` and `tsserver.orgnizeImportOnSave`

  Both default to false.

- Add tests for completion sources.

# 2018-08-14

- Fix remote source not working.
- Fix sort of completion items.
- Fix EPIPE error from net module.
- Add `tslint.lintProject` command.
- Add config `coc.preferences.maxCompleteItemCount`.
- Add `g:coc_auto_copen`, default to `1`.

# 2018-08-12

- **Break change** `:CocRefresh` replaced with `call CocAction('refreshSource')`.
- Add support filetype change of buffer.
- Add basic test for completion.
- Improve loading speed, use child process to initialize vim sources.
- Improve install.sh, install node when not exists.
- Improve interface of workspace.
- Fix loading of configuration content.

# 2018-08-11

- Fix configuration content not saved on change.
- Fix thrown error on watchman not found.
- Fix incompatible options of `child_process`.
- Fix location list for diagnostics.

  - Reset on `BufWinEnter`.
  - Available for all windows of single buffer.
  - Use replace on change for coc location list.
  - Add debounce.

- Fix signature help behaviour, truncate messages to not overlap.
- Reworks sources use async import.

# 2018-08-10

- Fix dispose for all modules.
- Add support for multiple `addWillSaveUntilListener`.
- Fix `startcol` for json server.
- Add support filetype `javascriptreact` for tsserver.

# 2018-08-09

- Add `coc#util#install` for installation.
- Add `install.cmd` for windows.

# 2018-08-08

- Improved location list for diagnostics.
- Add `internal` option to command.

  Commands registered by server are internal.

- Add support for multiple save wait until requests.

# 2018-08-07

- Add `forceFullSync` to language server option.

# 2018-08-05

- Improve eslint extension to use workspaceFolder.
- Fix watchman not works with multiple roots.
- Add feature: dynamic root support for workspace.
- **Break change** output channel of watchman is removed.

# 2018-08-04

- Fix order of document symbols.
- Fix completion snippet with $variable.
- Add feature: expand snippet on confirm.
- Add feature: `<Plug>(coc-complete-custom)` for complete custom sources.

  Default customs sources: `emoji`, `include` and `word`

- **Break change** `emoji` `include` used for all filetypes by default.

# 2018-08-03

- Add command `:CocErrors` for debug.
- Support `DocumentSymbol` for 'textDocument/documentSymbol'

# 2018-08-02

- Fix error of language client with unsupported schema.

  No document event fired for unsupported schema (eg: fugitive://)

- Fix update empty configuration not works.

# 2018-07-31

- Improve file source triggered with dirname started path.

# 2018-07-30

- Fix source ultisnip not working.
- Fix custom language client with command not working.
- Fix wrong arguments passed to `runCommand` function.
- Improve module install, add `sudo` for `npm install` on Linux.
- Improve completion on backspace.
  - Completion is resumed when search is empty.
  - Completion is triggered when user try to fix search.

# 2018-07-29

- **Break change** all servers are decoupled from coc.nvim

  A prompt for download is shown when server not found.

- **Break change** `vim-node-rpc` decoupled from coc.nvim

  A prompt would be shown to help user install vim-node-rpc in vim.

- Add command `CocConfig`

# 2018-07-28

- Fix uncaught exception error on windows.
- Use plugin root for assets resolve.
- Fix emoji source not triggered by `:`.
- Improve file source to recognize `~` as user home.

# 2018-07-27

- Prompt user for download server module with big extension like `vetur` and `wxml-langserver`
- **Break change**, section of settings changed: `cssserver.[languageId]` moved to `[languageId]`

  For example: `cssserver.css` section is moved to `css` section.

  This makes coc settings of css languages the same as VSCode.

- **Break change**, `stylelint` extension is disabled by default, add

  ```
  "stylelint.enable": true,
  ```

  to your `coc-settings.json` to enable it.

  User will be prompted to download server if `stylelint-langserver` is not
  installed globally.

- **Break change**, `triggerAfterInsertEnter` is always `true`, add

  ```
  "coc.preferences.triggerAfterInsertEnter": false,
  ```

  to your `coc-settings.json` to disable it.

- **Break change**, when `autoTrigger` is `always` completion would be triggered
  after completion item select.

# 2018-07-24

- better statusline integration with airline and lightline.

# 2018-07-23

- Coc service start much faster.
- Add vim-node-rpc module.
- **Break change** global function `CocAutocmd` and `CocResult` are removed.
- Support Vue with vetur

# 2018-07-21

- Fix issue with `completeopt`.
- Add source `neosnippet`.
- Add source `gocode`.

# 2018-07-20

- Add documentation for language server debug.
- Rework register of functions, avoid undefined function.

# 2018-07-19

- Fix error of `isFile` check.
- Ignore undefined function on service start.

# 2018-07-17

- Add `coc.preference.jumpCommand` to settings.
- Make coc service standalone.

# 2018-07-16

- Support arguments for `runCommand` action.
- Add coc command `workspace.showOutput`.
- Support output channel for language server.
- Support `[extension].trace.server` setting for trace server communication.

# 2018-07-15

- Support location list for diagnostic.
- Add tsserver project errors command.

# 2018-07-14

- Add support for `preselect` of complete item.
- Add support for socket language server configuration.
- Fix configured language server doesn't work.
- Add `workspace.diffDocument` coc command.
- Fix buffer sometimes not attached.
- Improve completion of JSON extension.

# 2018-07-13

- **Break change:** `diagnostic` in setting.json changed to `diagnostic`.
- Fix clearHighlight arguments.
- Add eslint extension https://github.com/Microsoft/vscode-eslint.
- Fix snippet break with line have $variable.
- Use jsonc-parser replace json5.
- Add `data/schema.json` for coc-settings.json.

# 2018-07-12

- Fix restart of tsserver not working.
- Fix edit of current buffer change jumplist by using `:keepjumps`.

