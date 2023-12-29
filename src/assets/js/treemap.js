import React from 'react'
import ReactDOM from 'react-dom'
import 'jquery';
import '../../components/Dashboard/jquery.ui.treemap'

alert(12);

export const initTreeMap = () => {
    let data = [{ name: 'def', children: [ { name: 'item1', value: 3000 }, { name: 'item2', value: 5000 } ]}];
    let data2 = [{ id: 'item1', value: 3000 }, { id: 'item2', value: 5000 }];
    
    $("#treemap").treemap({
        "dimensions":[900,300],
        "sizeOption":1,
        "innerNodeHeaderLabeller": myInnerNodeHeaderLabeller,
        "leafNodeBodyLabeller": myLeafNodeBodyLabeller,
        "labelsEnabled":true,
        "nodeBorderWidth":1,
        "animationEnabled":true,
        "animationDurationMs":2000,
        "animationEasing":TreemapUtils.Easing["ease-in-out"],
        "nodeData": {
            "id":"2fc414e2", "children":[
                {"id":"23f627dc", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.39], "children":[
                    {"id":"ce96d31f", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.74]},
                    {"id":"91e0ea1d", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.98]},
                    {"id":"62188591", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.39]},
                    {"id":"b80861a4", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.19]},
                    {"id":"9216f340", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.52]},
                    {"id":"40236148", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98]},
                    {"id":"c12264b7", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.74]}
                ]},
                {"id":"126debf5", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.52], "children":[
                    {"id":"634c7555", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.74]},
                    {"id":"2eac5833", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.98]},
                    {"id":"50790bdd", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.39]},
                    {"id":"15b8f1e1", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.19]},
                    {"id":"4e14522d", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.52]},
                    {"id":"92cf9150", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98]},
                    {"id":"97794307", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.74]}
                ]},
                {"id":"7e3f0349", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.74], "children":[
                    {"id":"1dbf73a8", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.74]},
                    {"id":"caefaba5", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.98]},
                    {"id":"89bd30be", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.39], "children":[
                        {"id":"7d56b381", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.74]},
                        {"id":"5f3fcf29", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.98]},
                        {"id":"50aa205c", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.39]},
                        {"id":"beba7a53", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.19]},
                        {"id":"b15f0ae4", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.52]},
                        {"id":"cecbda69", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98]},
                        {"id":"496c7052", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.74]}
                    ]},
                    {"id":"57582ef2", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.19]},
                    {"id":"ef593822", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.52]},
                    {"id":"c93cd65d", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98]},
                    {"id":"81c3e4d8", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.74]}
                ]},
                {"id":"a3bec3a8", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.52], "children":[
                    {"id":"27605654", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.74]},
                    {"id":"a113de2d", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.98]},
                    {"id":"121fec09", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.39]},
                    {"id":"0b1c34bf", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.19]},
                    {"id":"6e4576d4", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.52]},
                    {"id":"55d92db9", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98]},
                    {"id":"8dca9e0e", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.74]}
                ]},
                {"id":"c467043d", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.39], "children":[
                    {"id":"e0b3ced3", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.74]},
                    {"id":"904ad26e", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.98]},
                    {"id":"8f58816c", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.39]},
                    {"id":"ee1ca0bb", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.19]},
                    {"id":"1f7df236", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.52]},
                    {"id":"e411614a", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98]},
                    {"id":"234fa244", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.74]}
                ]},
                {"id":"ae6f93e2", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98], "children":[
                    {"id":"4511fee8", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.74]},
                    {"id":"ab206acd", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.98]},
                    {"id":"d436ff53", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.39]},
                    {"id":"25a300d6", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.19]},
                    {"id":"391c72a8", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.52]},
                    {"id":"7071d634", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98]},
                    {"id":"939985e5", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.74]}
                ]},
                {"id":"08095bd4", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.85], "children":[
                    {"id":"0e27d9c9", "size":[.25,.7078533757055014,.08038695496678606,.1798013810278924], "color":[.74]},
                    {"id":"2fa79804", "size":[.25,.04716253184550722,.11885651163331237,.21906028099441757], "color":[.98]},
                    {"id":"e3ede063", "size":[.16667,.06122787130028486,.22720306420190928,.13172295366450237], "color":[.39]},
                    {"id":"40e92699", "size":[.125,.030236144312274546,.13194188815903038,.22872719830190025], "color":[.19]},
                    {"id":"9296b705", "size":[.083333,.13627056790452963,.19140993988513774,.008958104928028555], "color":[.52]},
                    {"id":"432db33d", "size":[.083333,.008355967011586606,.12493818313339286,.15427971304890944], "color":[.98]},
                    {"id":"4a01b07c", "size":[.041666667,.00889354192031559,.12526345802043118,.07745036803434943], "color":[.74]}
                ]},
            ]
        }
    });
}