#!/bin/bash

if hash jq 2>/dev/null; then

    #app_json_path = "Voaty/voaty_app.json"
    app_json_path="/Users/urosmil/Documents/AppConveyor/Voaty/Voaty/app.json"

    jsonStr=`cat $app_json_path`
    #jsonStr='{ "key1": "value1", "key2": "value2", "key3": "value3" }'

    buildDate=$(date "+%Y%m%d%H%M%S")

    jsonStr=$(jq 'del(.version)' <<<"$jsonStr")
    jsonStr=$(jq --arg buildDate $buildDate '. + { "version": $buildDate  | tonumber }' <<<"$jsonStr")

    #echo $jsonStr > $app_json_path

    jq '.' <<<"$jsonStr" | tee app.json

else

    echo "Script requires 'jq' but it's not installed.  Aborting.";

fi
