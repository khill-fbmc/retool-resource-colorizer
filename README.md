# Retool Resource Colorizer
Colorize the header backgrounds of ReTool Workflow Blocks

![Screenshot of resource blocks with custom colors](https://github.com/khill-fbmc/retool-resource-colorizer/blob/main/screenshot.png?raw=true)

# Install
Visit [OpenUserJS](https://openuserjs.org/scripts/khill-fbmc/ReTool_Resource_Colorizer) to install

# Usage
The coloring of the headers is based on the extracted text from the title of the block. This is not ideal, but it works for me :)

## Built-In Classes
There are currently 2 built-in classes for error and success, which map to red and green
 - If the title of a block contains `error` then it will be colored a pale `red`.
 - If the title of a block contains `success` then it will be colored a pale `green`.
   - `_` are mostly ignored and used for visual clarity. All the following would match for `error`
   - `errorWithBlock`, `error_ThisFailed`, `failureWith_____error`

## CSS Colors
Any valid CSS color name can also be used, if prefixed with `_$`
  - If the title of a block contains `_$` then it will be split on that token, and the right hand side will be used as a CSS color name
    - Example: `happyPath_$skyblue` would be set the color `skyblue`

