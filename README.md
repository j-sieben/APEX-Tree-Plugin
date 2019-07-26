# APEX Tree Plugin
 Plugin to use an apex.treeView as a page item or a refreshable region

## Background

It all started with the requirement to collect authorization rights for applications to combine them to roles. It was found that a tree view would be an easy option to achieve that. I started working with the `apex.treeView` implementation. As a matter of fact we developed the solution for Apex 5.0 where it is not that easy to add checkboxes to the treeas it is today. But this has been done several times. I began with the implementation of [Ezhik](https://ezhikorn.wordpress.com/2017/10/18/apex-5-treeview-true-checkbox/) who in turn based his work on Jon Snyders blog around that topic.

I then found it cumbersome that the apex.treeView does not supprt AJAX refreshes, so when choosing a different application, I will have to refresh the whole page. To overcome this, I looked into the work of [mennooo](https://github.com/mennooo/orclapex-treeview-refresh) who digged into refreshing the `apex.treeView` dynamically.

I learned a lot from their work but at the end I felt something different had to be done. I didn't really liked mennooo's approach of creating a dynamic action plugin to enable the tree to refresh and thought it should be possible to have both options (refresh and checkboxes) in one plugin.

## Solution
I decided to create two plugins based on one JavaScript file which in essence is a wrapper around `apex.treeView` (hence the name `treeViewWrapper.js`). The plugins are

* A region plugin with the ability to dynamically refresh the tree
* An item plugin that encapsulates `apex.treeView` as a page item and allows to select entries with checkboxes.

The item plugin is especially useful as I strongly dislike the idea of having a region with a value. Using `apex.treeView` as the basis for a normal page item makes it something like the shuttle control. It's very easy to integrate into the page as it has a setValue, getValue method, allows for cascading lov support and so on. The page item will send the id list of the selected leafs using the same mechanism like a shuttle control: as a colon separated list of IDs.

The region plugin is refreshable which comes in handy if you want to edit the entries by clicking on them. The region automatically binds to the `apexafterdialogclose` event and refreshes itself, maintaining its visual state. I really like this approach from mennooo. As mennooo pointed out, you need to create links by calling the `apex_util.prepare_url`. This method allows to set the triggering item. This item should be set to the `static region id` you define for your region plugin.

## Differences

Some functionality of the original `apex.treeView` is not supported when using the plugins. If you use the region plugin, it does not support having a page item to hold the values, as this is achieved with the page item plugin. The page item plugin on the other hand does not support links, as I found it strange that a page item calls other pages when selecting values. Obviously the plugin does not support the legacy `jsTree` anymore.

## Installation
The installation is not that condensed as you may be used to from other plugins. The code is separated into database packages, the files are separate from the plugin to be copied to the web server. You may decide to throw anything together on the page, but I don't like that approach and don't want to support it.

Therefore you need to download the plugin, install the packages, import the plugin and copy the files to the web folder. There is a need to adjust the file path settings. This can be done after importing the plugins by adjusting the `File Prefix` attribute. I normally have folders for `css` and `js`. If you don't follow that route, you have to adjust the file pathes as well.

The plugin has a dependency to my `UTL_TEXT` package, espacially to the `BULK_REPLACE` method. You can donwload `UTL_TEXT` [here](https://github.com/j-sieben/UTL_TEXT), roll your own bulk replace method or simply replace the calls with a nested `REPLACE`.
