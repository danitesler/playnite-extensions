
## English

Based on danitesler's [GameHoverDetails](https://github.com/danitesler/playnite-extensions), the following improvements have been made:

- **Fixed the issue where hover details did not close after switching interface via hotkey**: Added a periodic check (every 500ms) during the hover details display to verify whether the current state remains valid, ensuring the details close automatically when switching to another interface
- **Added UI localization support**: Extracted hardcoded strings into resource files, currently including both Chinese and English language packs (`zh_CN.xaml` / `en_US.xaml`)

## 中文

基于 danitesler 的 [GameHoverDetails](https://github.com/danitesler/playnite-extensions) 进行了以下改进：

- **修复热键切换界面后悬停详情不关闭的问题**：在悬停信息显示期间，每隔 500ms 检查一次显示状态是否合法，确保切换到其他界面时详情能自动关闭
- **支持界面本地化**：将硬编码文本抽取为资源文件，目前已包含中英文语言包（`zh_CN.xaml` / `en_US.xaml`）
