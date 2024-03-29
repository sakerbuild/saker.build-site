[!section](server_upload.md)
[!section](server_index.md)

# server

<div class="doc-cmdref-cmd-usage">

server [@command-file] [subcommand] ...

</div>

<div class="doc-cmdref-cmd-doc">

Top level command for interaction with the server bundle storage.

</div>

##### Sub-commands

[!tableofcontents]()

##### @command-file

<div class="doc-cmdref-param-aliases">@command-file
</div>

<div class="doc-cmdref-param-flags">
</div>

<div class="doc-cmdref-param-doc">

File path prefixed with '@' to directly include arguments from the 
specified file. Each argument is on its separate line. They are
directly inserted in place of the @command-file argument. 
The argument can appear anywhere on the command line. Escaping
is not supported for arguments in the command file. 
The file path may be absolute or relative.

E.g: @path/to/arguments.txt

</div>

