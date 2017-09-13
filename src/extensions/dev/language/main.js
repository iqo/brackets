/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    var CommandManager         = brackets.getModule("command/CommandManager"),
        Commands               = brackets.getModule("command/Commands"),
        Menus                  = brackets.getModule("command/Menus"),
        Strings                = brackets.getModule("strings"),
        FileSystem             = brackets.getModule("filesystem/FileSystem"),
        FileUtils              = brackets.getModule("file/FileUtils"),
        Dialogs                = brackets.getModule("widgets/Dialogs"),
        LocalizationUtils      = brackets.getModule("utils/LocalizationUtils"),
        PerfDialogTemplate     = require("text!htmlContent/perf-dialog.html"),
        LanguageDialogTemplate = require("text!htmlContent/language-dialog.html");

    
    // Function to run when the menu item is clicked
    /*function handleHelloWorld() {
        window.alert("Hello, world!");
    }*/
    
        function handleSwitchLanguage() {
        var stringsPath = FileUtils.getNativeBracketsDirectoryPath() + "/nls";

        FileSystem.getDirectoryForPath(stringsPath).getContents(function (err, entries) {
            if (!err) {
                var $dialog,
                    $submit,
                    $select,
                    locale,
                    curLocale = (brackets.isLocaleDefault() ? null : brackets.getLocale()),
                    languages = [];

                var setLanguage = function (event) {
                    locale = $select.val();
                    $submit.prop("disabled", locale === (curLocale || ""));
                };

                // inspect all children of dirEntry
                entries.forEach(function (entry) {
                    if (entry.isDirectory) {
                        var match = entry.name.match(/^([a-z]{2})(-[a-z]{2})?$/);

                        if (match) {
                            var language = entry.name,
                                label = match[1];

                            if (match[2]) {
                                label += match[2].toUpperCase();
                            }

                            languages.push({label: LocalizationUtils.getLocalizedLabel(label), language: language});
                        }
                    }
                });
                // add English (US), which is the root folder and should be sorted as well
                languages.push({label: LocalizationUtils.getLocalizedLabel("en"),  language: "en"});

                // sort the languages via their display name
                languages.sort(function (lang1, lang2) {
                    return lang1.label.localeCompare(lang2.label);
                });

                // add system default (which is placed on the very top)
                languages.unshift({label: Strings.LANGUAGE_SYSTEM_DEFAULT, language: null});

                var template = Mustache.render(LanguageDialogTemplate, {languages: languages, Strings: Strings});
                Dialogs.showModalDialogUsingTemplate(template).done(function (id) {
                    if (id === Dialogs.DIALOG_BTN_OK && locale !== curLocale) {
                        brackets.setLocale(locale);
                        CommandManager.execute(Commands.APP_RELOAD);
                    }
                });

                $dialog = $(".switch-language.instance");
                $submit = $dialog.find(".dialog-button[data-button-id='" + Dialogs.DIALOG_BTN_OK + "']");
                $select = $dialog.find("select");

                $select.on("change", setLanguage).val(curLocale);
            }
        });
    }
    
    // First, register a command - a UI-less object associating an id to a handler
    var HELP_SWITCH_LANGUAGE = "help.switchLanguage";   // package-style naming to avoid collisions
    CommandManager.register(Strings.CMD_SWITCH_LANGUAGE, HELP_SWITCH_LANGUAGE, handleSwitchLanguage);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.HELP_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(HELP_SWITCH_LANGUAGE);
    menu.addMenuDivider();
    // We could also add a key binding at the same time:
    //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-W");
    // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)
});