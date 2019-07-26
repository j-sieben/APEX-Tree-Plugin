# APEX Tree Plugin
 Plugin to use an apex.treeView as a page item or a refreshable region

## Background

It all started with the requirement to collect authorization rights for applications to combine them to roles. It was found that a tree view would be an easy option to achieve that. I started working with the apex.treeView implementation. As the version we develop the solution for is Apex 5.0, it is not that easy as it is today to add checkboxes to the tree, but this has been done several times. I began with the implementation of [Ezhik](https://ezhikorn.wordpress.com/2017/10/18/apex-5-treeview-true-checkbox/) who in turn based his work on Jon Snyders blog around that topic.

I then found it cumbersome that the apex.treeView does not supprt AJAX refreshes, so if I choose a different application, I had to refresh the whole page. Again, I based my work on the work of [mennooo](https://github.com/mennooo/orclapex-treeview-refresh) who digged into refreshing the apex.treeView dynamically.

I learned a lot from their work but at the end I felt something different had to be done. I didn't really liked mennooo's approach of creating a dynamic action plugin to enable the tree to refresh and though it should be possible to have both options (refresh and checkboxes) in one plugin.

## Solution
I decided to create two plugins based on one JavaScript file which in essence is a wrapper around apex.treeView (hence the name treeViewWrapper.js). The plugins are

* A region plugin with the ability to refresh to enable users to change the entries of the tree
* An item plugin that encapsulates apex.treeView as a page item and allows to select entries with checkboxes.

The item plugin is especially useful as I strongly dislike the idea of having a region with a value. Having the apex.treeView inside a normal page item makes it something like the shuttle control. It's very easy to integrate it into the page as it has a setValue, getValue method, allows for cascading lov support and so on.

## Differences
Some functionality of the original apex.treeView is not supported when using the plugins. If you use the region plugin, it does not support having a page item to hold the values, as this is achieved with the page item plugin. The page item plugin on the other hand does not support links, as I found it strange that a page item calls other pages when selecting values. Obviously the plugin does not support the legacy `jsTree` anymore.

## Installation
The installation is not that condensed as you may be used to from other plugins. The code is separated into database packages, the files are separate from the plugin to be copied to the web server. You may decide to throw anything together on the page, but I don't like that approach and don't want to support it.

Therefore you need to download the plugin, install the packages, import the plugin and copy the files to the web folder. There is a need to adjust the file path settings. This can be done after importing the plugins by adjusting the `File Prefix` attribute. I normally have folders for `css` and `js`. If you don't follow that route, you have to adjust the file pathes as well.
