# Network Analyse Back end

This is the network analyze core project.

## Clone

`git clone project link`

## Description

First of all you have to scan your network to generate some files (we called nscan) that represents your network composition on the current date.
Excecute the script in every network you want to scan. Every network is consider as an entity.

## Import nscan files

These files are important to make nw core works.

Clone the nscan project. [nscan](https://github.com/zenetys/ztools/tree/master/nscan)

Execute the nscan script to create your nscan files.

Script Example

nscan ... \
    -c '192.168.56.*:snmp:v2:ro_com_56:stop' \
    -c '10.1.1.11:snmp:v3:monitoring:SHA:authpass:AES:privpass:stop' \
    -c '10.*:snmp:v2:snmp_ro' \
    -c '*:snmp:v2:public' \
    -c '*:snmp:v1:public' \
    ...

## Copy nscan files

In your networkAnalyze directory create entity directories `./data/entity-name`.

Copy nscan files generated to the `./data/entity-name`  directory.

## Generate MacVendor List

Execute the script `./gen-json-oui-db`

This will generate `oui.json` file that contain mac producers.

## Start the project

Run

`./serve`


