import * as go from 'gojs';
import { v4 as uuidv4 } from 'uuid';
import { getArtifactUrl } from './utils';

export function initEntitiesDiagram() {
    const gjs = go.GraphObject.make;

    let dg = gjs(go.Diagram, 
        {
            initialContentAlignment: go.Spot.Center,
            "animationManager.initialAnimationStyle": go.AnimationManager.None,
            "undoManager.isEnabled": true,
            positionComputation: function (diagram: any, pt: go.Point) {
                return new go.Point(Math.floor(pt.x), Math.floor(pt.y));
            },
            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
            "clickCreatingTool.archetypeNodeData": { text: "Новый", name: 'Новый', type: 'defaultNodeType', isGroup: true, zorder: 1 },
            "linkingTool.archetypeLinkData": { type: 'logicLinkType', category: '' },
            
            model: gjs(go.GraphLinksModel,
                {
                    nodeKeyProperty: 'id',
                    linkKeyProperty: 'id',
                    makeUniqueLinkKeyFunction: (model: go.GraphLinksModel, data: go.ObjectData) => {
                        var key = uuidv4();
                        return key;
                    }
                }),
            
        });

    dg.animationManager.isEnabled = false;
    dg.toolManager.dragSelectingTool.isEnabled = true;
    dg.toolManager.draggingTool.isCopyEnabled = false;

    let lnktool = dg.toolManager.linkingTool;
    lnktool.insertLink = function (fromnode: go.Node, fromport, tonode: go.Node, toport) {

        let zOrder = 1;
        if (typeof fromnode.data.zorder !== 'undefined')
            zOrder = Math.max(zOrder, fromnode.part ? fromnode.part.zOrder : 0);
        if (typeof tonode.data.zorder !== 'undefined')
            zOrder = Math.max(zOrder, tonode.part ? tonode.part.zOrder : 0);

        if (lnktool.archetypeLinkData)
            lnktool.archetypeLinkData.zorder = zOrder + 1;

        fromnode.part?.diagram?.model.setDataProperty(fromnode.data, 'isFk', true);

        return go.LinkingTool.prototype.insertLink.call(lnktool, fromnode, fromport, tonode, toport)
    };

    dg.groupTemplate = gjs(go.Group, "Auto", {
        layout: gjs(go.TreeLayout,
            {
                alignment: go.TreeLayout.AlignmentStart,
                angle: 0,
                compaction: go.TreeLayout.CompactionNone,
                layerSpacing: 16,
                layerSpacingParentOverlap: 1,
                nodeIndentPastParent: 1.0,
                nodeSpacing: 0,
                sorting: go.TreeLayout.SortingAscending,
                comparer: function (va: go.TreeVertex, vb: go.TreeVertex) {
                    if (!va.node || !vb.node)
                        return 0;
                    let da = va.node.data;
                    let db = vb.node.data;
                    if (parseInt(da.order) < parseInt(db.order)) return -1;
                    if (parseInt(da.order) > parseInt(db.order)) return 1;
                    return 0;
                }
            }),
            selectionChanged: function(grp: go.Part) {
                var lay = grp.isSelected ? "Foreground" : "";
            },
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("zOrder", "zorder", parseInt),
        new go.Binding("visible", "hidden", function (v) { return !v; }),
        gjs(go.Shape, "RoundedRectangleWithHeader", // surrounds everything
            { 
            parameter1: 10, fill: "white", stroke: '#aa97d5', strokeWidth: 1, strokeDashArray: [2, 2] },
            new go.Binding("parameter2", "isSelected", function (v) { return v ? 0 : 10; }).ofObject()),
        gjs(go.Panel, "Vertical",  // position header above the subgraph
            { //portId: '', fromLinkable: true, toLinkable: true,
                defaultAlignment: go.Spot.Left, padding: 0, margin: 0, minSize: new go.Size(170, 30) },

            gjs(go.Shape, "RoundedTopRectangle", {
                    parameter1: 10,
                    stroke: 'black',
                    fill: 'black',
                    height: 10,
                    stretch: go.GraphObject.Fill,
                    cursor: 'pointer',
                    //click: function(e:any, obj:any) { if (obj.part.data) window.open(getArtifactUrl(obj.part.data.id, obj.part.data.artifactType), '_blank'); }
                },
                new go.Binding('stroke', 'color'),
                new go.Binding('fill', 'color')),
            gjs(go.Panel, "Auto",  // the header
                { defaultAlignment: go.Spot.TopLeft, stretch: go.GraphObject.Fill },
                new go.Binding('stroke', 'color'),
                new go.Binding('strokeWidth', '0'),
                gjs(go.Shape, "Rectangle", {  },
                    new go.Binding('fill', 'color'),
                    new go.Binding('stroke', 'color')
                ),
                gjs(go.Panel, "Vertical",
                    { defaultAlignment: go.Spot.TopLeft },
                    gjs(go.TextBlock, // group title near top, next to button
                        { font: "12px Inter", margin: new go.Margin(0, 10, 6, 10), stroke: '#ffffff', cursor: 'pointer', click: function(e:any, obj:any) { if (obj.part.data) window.open(getArtifactUrl(obj.part.data.id, obj.part.data.artifactType), '_blank'); } },
                        new go.Binding("text", "artifactType", function (at) {
                            switch (at) {
                                case 'entity': return 'Лог. объект';
                                case 'entity_sample': return 'Сэмпл';
                                case 'domain': return 'Домен';
                                case 'system': return 'Система';
                                case 'product': return 'Продукт';
                                case 'business_entity': return 'Бизнес-сущность';
                                case 'entity_query': return 'Запрос';
                                case 'indicator': return 'Показатель';
                                case 'data_asset': return 'Актив';
                            }
                            return at;
                        })),
                    gjs(go.TextBlock, // group title near top, next to button
                        { 
                            font: "bold 12px Inter", margin: new go.Margin(0, 10, 6, 10), stroke: '#ffffff', cursor: 'pointer', click: function(e:any, obj:any) { if (obj.part.data) window.open(getArtifactUrl(obj.part.data.id, obj.part.data.artifactType), '_blank'); } },
                        new go.Binding("text", "text"))
                )
            ),
            gjs(go.Placeholder,     // represents area for all member parts
                { background: "transparent", margin: 4, stretch: go.GraphObject.Horizontal })
        ));

        dg.groupTemplate.selectionAdornmentTemplate = gjs(go.Adornment, "Spot",
            gjs(go.Panel, "Auto",
                gjs(go.Shape, "RoundedRectangleWithHeader", { parameter1: 10, parameter2: 10, fill: null, stroke: "#7986cb", strokeWidth: 3 },
                    new go.Binding("figure", "figure")),
                gjs(go.Panel, "Vertical",
                    gjs(go.Placeholder),  // a Placeholder sizes itself to the selected Node
                    gjs(go.Panel, "Auto", { stretch: go.GraphObject.Fill },
                    )
                )
            )
        );

    dg.nodeTemplate =
        gjs(go.Node,
            { // no Adornment: instead change panel background color by binding to Node.isSelected
                selectionAdorned: true,
                movable: false
            },
            
            gjs(go.Panel, "Horizontal",
                {
                    portId: '', fromLinkable: true,
                    toLinkable: true, cursor: "pointer",
                    stretch: go.GraphObject.Fill,
                    minSize: new go.Size(170, 30),
                    fromLinkableSelfNode: true,
                    toLinkableSelfNode: true,
                    
                },

                /*gjs("Button",
                    {
                        click: function (e, obj: any) {
                            var diagram = e.diagram;
                            var node = diagram.findNodeForKey(obj.part.data.id);
                            if (node !== null) {
                                node.findNodesOutOf().each(function (n) {
                                    if (n.containingGroup && node?.containingGroup && n.containingGroup.data.id === node.containingGroup.data.id) {
                                        let v = (typeof n.data.isHidden === 'undefined' ? false : n.data.isHidden);
                                        e.diagram.model.setDataProperty(n.data, 'isHidden', !v);
                                    }
                                });
                            }
                        }
                    },
                    new go.Binding("visible", "", function (data) { return typeof(data.properties) !== 'undefined' && typeof data.properties.hasChildren !== 'undefined' && data.properties.hasChildren == 'true'; }),
                    gjs(go.Shape, "ExpandedLine", { width: 6, height: 6 })
                ),*/
                /*gjs(go.Shape, "Rectangle", { width: 10, height: 10, stroke: null, fill: null },
                    new go.Binding("visible", "", function (data) { return typeof data.properties === 'undefined' || typeof data.properties.hasChildren === 'undefined' || data.properties.hasChildren != 'true'; })
                ),*/
                gjs(go.Picture, { source: '/pk.png', width: 16, height: 16, margin: 4,  },
                    new go.Binding("visible", "isPk")),
                gjs(go.Picture, { source: '/fk.png', width: 16, height: 16, margin: 4,  },
                    new go.Binding("visible", "isFk")),
                gjs(go.Shape, "Rectangle", { width: 16, height: 16, margin: 4, stroke: null, fill: null },
                    new go.Binding("visible", "", function(data) { return !data.isPk && !data.isFk; })),
                /*gjs(go.Picture, { width: 16, height: 6, margin: 4,  },
                    new go.Binding("visible", "isKey", function (v) { return !v; }),
                    new go.Binding("source", "datatype", function (v) { return '/img/datatypes/' + v + '.svg' })),*/
                gjs(go.TextBlock, 
                    { font: '9pt Verdana, sans-serif' },
                    new go.Binding("text", "text", function (t) { return t; })
                    )

            ),  // end Horizontal Panel
        );

    let urlNodeTemplate = gjs(go.Node,
        { // no Adornment: instead change panel background color by binding to Node.isSelected
            selectionAdorned: false,
            movable: false
        },
        gjs(go.Panel, "Horizontal",
            {
                portId: '', fromLinkable: true,
                toLinkable: true, cursor: "pointer",
                stretch: go.GraphObject.Fill,
                minSize: new go.Size(170, 30),
                fromLinkableSelfNode: true,
                toLinkableSelfNode: true,
                
            },
            gjs("Button",
                {
                    click: function (e, obj: any) {
                        var diagram = e.diagram;
                        var node = diagram.findNodeForKey(obj.part.data.id);
                        if (node !== null) {
                            node.findNodesOutOf().each(function (n) {
                                if (n.containingGroup && node?.containingGroup && n.containingGroup.data.id === node.containingGroup.data.id) {
                                    let v = (typeof n.data.isHidden === 'undefined' ? false : n.data.isHidden);
                                    e.diagram.model.setDataProperty(n.data, 'isHidden', !v);
                                }
                            });
                        }
                    }
                },
                new go.Binding("visible", "", function (data) { return typeof(data.properties) !== 'undefined' && typeof data.properties.hasChildren !== 'undefined' && data.properties.hasChildren == 'true'; }),
                gjs(go.Shape, "ExpandedLine", { width: 6, height: 6 })
            ),
            gjs(go.Shape, "Rectangle", { width: 10, height: 10, stroke: null, fill: null },
                new go.Binding("visible", "", function (data) { return typeof data.properties === 'undefined' || typeof data.properties.hasChildren === 'undefined' || data.properties.hasChildren != 'true'; })
            ),
            gjs(go.TextBlock,
                { font: '9pt Verdana, sans-serif', stroke: "#889BF5", click: function(e:any, obj:any) { if (obj.part.data) window.open(obj.part.data.url, '_blank');  } },
                new go.Binding("text", "text", function (t) { return t; })
                )

        ),
    );

    // define the Link template, representing a relationship
    dg.linkTemplate =
        gjs(go.Link,  // the whole link panel
            {
                selectionAdorned: true,
                reshapable: true,
                routing: go.Link.AvoidsNodes,
                corner: 5,
                curve: go.Link.JumpOver,
                fromEndSegmentLength: 10,
                toEndSegmentLength: 10,
                toShortLength: 1,
                adjusting: go.Link.None,
                fromSpot: go.Spot.LeftRightSides,
                toSpot: go.Spot.LeftRightSides
            },
            new go.Binding("zOrder", "zorder", parseInt),
            new go.Binding("points", "points").makeTwoWay(),
            gjs(go.Shape,  // the link shape
                { stroke: "#BDBDBD", strokeWidth: 1 }),
            gjs(go.Shape,  // the arrowhead
                { toArrow: "standard", stroke: null, fill: '#BDBDBD' }
                ),
            gjs(go.Shape,
                { fromArrow: "circle", stroke: '#BDBDBD', fill: 'whitesmoke', strokeWidth: 1, width: 8, height: 8 }
            ),
        );

    let treeLinkTpl = gjs(go.Link);

    let linkTplMap = new go.Map<string, go.Link>();
    linkTplMap.add("", dg.linkTemplate);
    linkTplMap.add("treeLink", treeLinkTpl);
    dg.linkTemplateMap = linkTplMap;

    let nodeTplMap = new go.Map<string, go.Part>();
    nodeTplMap.add("", dg.nodeTemplate);
    nodeTplMap.add("urlNodeType", urlNodeTemplate);
    dg.nodeTemplateMap = nodeTplMap;

    return dg;
}

export function initArtifactDiagram() {
    const gjs = go.GraphObject.make;

    let dg = gjs(go.Diagram, 
        {
            initialContentAlignment: go.Spot.Center,
            "animationManager.initialAnimationStyle": go.AnimationManager.None,
            "undoManager.isEnabled": true,
            positionComputation: function (diagram: any, pt: go.Point) {
                return new go.Point(Math.floor(pt.x), Math.floor(pt.y));
            },
            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
            "clickCreatingTool.archetypeNodeData": { text: "Новый", name: 'Новый', type: 'defaultNodeType', isGroup: true, zorder: 1 },
            "linkingTool.archetypeLinkData": { type: 'logicLinkType', category: '' },
            model: gjs(go.GraphLinksModel,
                {
                    nodeKeyProperty: 'id',
                    linkKeyProperty: 'id',
                    makeUniqueLinkKeyFunction: (model: go.GraphLinksModel, data: go.ObjectData) => {
                        var key = uuidv4();
                        return key;
                    }
                }),
        });

    dg.animationManager.isEnabled = false;
    dg.toolManager.dragSelectingTool.isEnabled = true;
    dg.toolManager.draggingTool.isCopyEnabled = false;

    let lnktool = dg.toolManager.linkingTool;
    lnktool.insertLink = function (fromnode: go.Node, fromport, tonode: go.Node, toport) {

        let zOrder = 1;
        if (typeof fromnode.data.zorder !== 'undefined')
            zOrder = Math.max(zOrder, fromnode.part ? fromnode.part.zOrder : 0);
        if (typeof tonode.data.zorder !== 'undefined')
            zOrder = Math.max(zOrder, tonode.part ? tonode.part.zOrder : 0);

        if (lnktool.archetypeLinkData)
            lnktool.archetypeLinkData.zorder = zOrder + 1;

        return go.LinkingTool.prototype.insertLink.call(lnktool, fromnode, fromport, tonode, toport)
    };

    lnktool.isEnabled = false;

    dg.groupTemplate = gjs(go.Group, "Auto", {
        layout: gjs(go.TreeLayout,
            {
                alignment: go.TreeLayout.AlignmentStart,
                angle: 0,
                compaction: go.TreeLayout.CompactionNone,
                layerSpacing: 16,
                layerSpacingParentOverlap: 1,
                nodeIndentPastParent: 1.0,
                nodeSpacing: 0,
                sorting: go.TreeLayout.SortingAscending,
                comparer: function (va: go.TreeVertex, vb: go.TreeVertex) {
                    if (!va.node || !vb.node)
                        return 0;
                    let da = va.node.data;
                    let db = vb.node.data;
                    if (parseInt(da.order) < parseInt(db.order)) return -1;
                    if (parseInt(da.order) > parseInt(db.order)) return 1;
                    return 0;
                }
            }),
            selectionChanged: function(grp: go.Part) {
                var lay = grp.isSelected ? "Foreground" : "";
            },
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("zOrder", "zorder", parseInt),
        new go.Binding("visible", "hidden", function (v) { return !v; }),
        gjs(go.Shape, "RoundedRectangleWithHeader", // surrounds everything
            { 
            parameter1: 10, fill: "white", stroke: '#aa97d5', strokeWidth: 1, strokeDashArray: [2, 2] },
            new go.Binding("parameter2", "isSelected", function (v) { return v ? 0 : 10; }).ofObject()),
        gjs(go.Panel, "Vertical",  // position header above the subgraph
            { portId: '', fromLinkable: true, toLinkable: true,
                defaultAlignment: go.Spot.Left, padding: 0, margin: 0, minSize: new go.Size(170, 30) },

            gjs(go.Shape, "RoundedTopRectangle", {
                    parameter1: 10,
                    stroke: 'black',
                    fill: 'black',
                    height: 10,
                    stretch: go.GraphObject.Fill,
                    cursor: 'pointer',
                    click: function(e:any, obj:any) { if (obj.part.data) window.open(getArtifactUrl(obj.part.data.id, obj.part.data.artifactType), '_blank'); }
                },
                new go.Binding('stroke', 'color'),
                new go.Binding('fill', 'color')),
            gjs(go.Panel, "Auto",  // the header
                { defaultAlignment: go.Spot.TopLeft, stretch: go.GraphObject.Fill },
                new go.Binding('stroke', 'color'),
                new go.Binding('strokeWidth', '0'),
                gjs(go.Shape, "Rectangle", {  },
                    new go.Binding('fill', 'color'),
                    new go.Binding('stroke', 'color')
                ),
                gjs(go.Panel, "Vertical",
                    { defaultAlignment: go.Spot.TopLeft },
                    gjs(go.TextBlock, // group title near top, next to button
                        { font: "12px Inter", margin: new go.Margin(0, 10, 6, 10), stroke: '#ffffff', cursor: 'pointer', click: function(e:any, obj:any) { if (obj.part.data) window.open(getArtifactUrl(obj.part.data.id, obj.part.data.artifactType), '_blank'); } },
                        new go.Binding("text", "artifactType", function (at) {
                            switch (at) {
                                case 'entity': return 'Лог. объект';
                                case 'entity_sample': return 'Сэмпл';
                                case 'domain': return 'Домен';
                                case 'system': return 'Система';
                                case 'product': return 'Продукт';
                                case 'business_entity': return 'Бизнес-сущность';
                                case 'entity_query': return 'Запрос';
                                case 'indicator': return 'Показатель';
                                case 'data_asset': return 'Актив';
                            }
                            return at;
                        })),
                    gjs(go.TextBlock,
                        { 
                            font: "bold 12px Inter", margin: new go.Margin(0, 10, 6, 10), stroke: '#ffffff', cursor: 'pointer', click: function(e:any, obj:any) { if (obj.part.data) window.open(getArtifactUrl(obj.part.data.id, obj.part.data.artifactType), '_blank'); } },
                        new go.Binding("text", "text"))
                )
            ),
            gjs(go.Placeholder,     // represents area for all member parts
                { background: "transparent", margin: 4, stretch: go.GraphObject.Horizontal })
        ));

        dg.groupTemplate.selectionAdornmentTemplate = gjs(go.Adornment, "Spot",
            gjs(go.Panel, "Auto",
                gjs(go.Shape, "RoundedRectangleWithHeader", { parameter1: 10, parameter2: 10, fill: null, stroke: "#7986cb", strokeWidth: 3 },
                    new go.Binding("figure", "figure")),
                gjs(go.Panel, "Vertical",
                    gjs(go.Placeholder),  // a Placeholder sizes itself to the selected Node
                    gjs(go.Panel, "Auto", { stretch: go.GraphObject.Fill },
                    )
                )
            )
        );

    dg.nodeTemplate =
        gjs(go.Node,
            { // no Adornment: instead change panel background color by binding to Node.isSelected
                selectionAdorned: true,
                movable: false
            },
            
            gjs(go.Panel, "Horizontal",
                {
                    portId: '', fromLinkable: true,
                    toLinkable: true, cursor: "pointer",
                    stretch: go.GraphObject.Fill,
                    minSize: new go.Size(170, 30),
                    fromLinkableSelfNode: true,
                    toLinkableSelfNode: true,
                    
                },

                gjs("Button",
                    {
                        click: function (e, obj: any) {
                            var diagram = e.diagram;
                            var node = diagram.findNodeForKey(obj.part.data.id);
                            if (node !== null) {
                                node.findNodesOutOf().each(function (n) {
                                    if (n.containingGroup && node?.containingGroup && n.containingGroup.data.id === node.containingGroup.data.id) {
                                        let v = (typeof n.data.isHidden === 'undefined' ? false : n.data.isHidden);
                                        e.diagram.model.setDataProperty(n.data, 'isHidden', !v);
                                    }
                                });
                            }
                        }
                    },
                    new go.Binding("visible", "", function (data) { return typeof(data.properties) !== 'undefined' && typeof data.properties.hasChildren !== 'undefined' && data.properties.hasChildren == 'true'; }),
                    gjs(go.Shape, "ExpandedLine", { width: 6, height: 6 })
                ),
                gjs(go.Shape, "Rectangle", { width: 10, height: 10, stroke: null, fill: null },
                    new go.Binding("visible", "", function (data) { return typeof data.properties === 'undefined' || typeof data.properties.hasChildren === 'undefined' || data.properties.hasChildren != 'true'; })
                ),
                gjs(go.Picture, { source: '/img/datatypes/pk.svg', width: 16, height: 16, margin: 4,  },
                    new go.Binding("visible", "isKey")),
                gjs(go.Picture, { width: 16, height: 6, margin: 4,  },
                    new go.Binding("visible", "isKey", function (v) { return !v; }),
                    new go.Binding("source", "datatype", function (v) { return '/img/datatypes/' + v + '.svg' })),
                gjs(go.TextBlock, 
                    { font: '9pt Verdana, sans-serif' },
                    new go.Binding("text", "text", function (t) { return t; })
                    )

            ),  // end Horizontal Panel
        );

    let urlNodeTemplate = gjs(go.Node,
        { // no Adornment: instead change panel background color by binding to Node.isSelected
            selectionAdorned: false,
            movable: false
        },
        gjs(go.Panel, "Horizontal",
            {
                portId: '', fromLinkable: true,
                toLinkable: true, cursor: "pointer",
                stretch: go.GraphObject.Fill,
                minSize: new go.Size(170, 30),
                fromLinkableSelfNode: true,
                toLinkableSelfNode: true,
                
            },
            gjs("Button",
                {
                    click: function (e, obj: any) {
                        var diagram = e.diagram;
                        var node = diagram.findNodeForKey(obj.part.data.id);
                        if (node !== null) {
                            node.findNodesOutOf().each(function (n) {
                                if (n.containingGroup && node?.containingGroup && n.containingGroup.data.id === node.containingGroup.data.id) {
                                    let v = (typeof n.data.isHidden === 'undefined' ? false : n.data.isHidden);
                                    e.diagram.model.setDataProperty(n.data, 'isHidden', !v);
                                }
                            });
                        }
                    }
                },
                new go.Binding("visible", "", function (data) { return typeof(data.properties) !== 'undefined' && typeof data.properties.hasChildren !== 'undefined' && data.properties.hasChildren == 'true'; }),
                gjs(go.Shape, "ExpandedLine", { width: 6, height: 6 })
            ),
            gjs(go.Shape, "Rectangle", { width: 10, height: 10, stroke: null, fill: null },
                new go.Binding("visible", "", function (data) { return typeof data.properties === 'undefined' || typeof data.properties.hasChildren === 'undefined' || data.properties.hasChildren != 'true'; })
            ),
            gjs(go.TextBlock,
                { font: '9pt Verdana, sans-serif', stroke: "#889BF5", click: function(e:any, obj:any) { if (obj.part.data) window.open(obj.part.data.url, '_blank');  } },
                new go.Binding("text", "text", function (t) { return t; })
                )

        ),
    );

    // define the Link template, representing a relationship
    dg.linkTemplate =
        gjs(go.Link,  // the whole link panel
            {
                selectionAdorned: true,
                reshapable: true,
                routing: go.Link.AvoidsNodes,
                corner: 5,
                curve: go.Link.JumpOver,
                fromEndSegmentLength: 10,
                toEndSegmentLength: 10,
                toShortLength: 1,
                adjusting: go.Link.None,
                fromSpot: go.Spot.NotRightSide,
                toSpot: go.Spot.AllSides
            },
            new go.Binding("zOrder", "zorder", parseInt),
            new go.Binding("points", "points").makeTwoWay(),
            gjs(go.Shape,  // the link shape
                { stroke: "#BDBDBD", strokeWidth: 1 }),
            gjs(go.Shape,  // the arrowhead
                { toArrow: "standard", stroke: null, fill: '#BDBDBD' }
                ),
            gjs(go.Shape,
                { fromArrow: "circle", stroke: '#BDBDBD', fill: 'whitesmoke', strokeWidth: 1, width: 8, height: 8 }
            ),
        );

    let treeLinkTpl = gjs(go.Link);

    let linkTplMap = new go.Map<string, go.Link>();
    linkTplMap.add("", dg.linkTemplate);
    linkTplMap.add("treeLink", treeLinkTpl);
    dg.linkTemplateMap = linkTplMap;

    let nodeTplMap = new go.Map<string, go.Part>();
    nodeTplMap.add("", dg.nodeTemplate);
    nodeTplMap.add("urlNodeType", urlNodeTemplate);
    dg.nodeTemplateMap = nodeTplMap;

    return dg;
}

const diagramDataToJson = (data:any) => {
    var res:any = {};
    for (let k in data) {
        if (k == 'points' && !Array.isArray(data[k]) && typeof data[k] != 'string') {
            if (data[k])
                res[k] = data[k].toArray();
            else
                res[k] = [];
        } else
            res[k] = data[k];
        if (k == 'points' && typeof data[k] != 'string')
            res[k] = JSON.stringify(res[k]);
    }
    return res;
};

export class SaveRequestData {
    updateNodes:any[] = [];
    updateLinks:any[] = [];
    deleteNodes:any[] = [];
    deleteLinks:any[] = [];

    isEmpty = () => {
        return this.updateNodes.length === 0 && this.deleteNodes.length === 0 && this.updateLinks.length === 0 && this.deleteLinks.length === 0;
    };

    addNode = (node:any) => {
        if (typeof node.data != 'undefined' && node.data)
        node = node.data;

        if (node instanceof go.Node)
            return;

        if (this.deleteNodes) {
            for (let i = 0; i < this.deleteNodes.length; i++) {
                if (this.deleteNodes[i].id === node.id)
                    return;
            }
        }

        if (typeof node.properties === 'undefined')
            node.properties = {};

        if (typeof node.group === 'undefined')
            node.group = '';

        if (typeof node.children !== 'undefined' && node.children) {
            for (let i = 0; ; i++) {
                if (typeof node.children[i] === 'undefined')
                    break;
            }
        }

        for (let i = 0; i < this.updateNodes.length; i++) {
            if (this.updateNodes[i].id === node.id) {
                this.updateNodes[i] = node;
                return;
            }
        }
        this.updateNodes.push(node);
    };

    deleteNode = (node_id:string) => {

        for (let i = 0; i < this.deleteNodes.length; i++) {
            if (this.deleteNodes[i] === node_id) {
                return;
            }
        }
        this.deleteNodes.push(node_id);
    };

    addLink = (link:any) => {
        if (typeof link.data != 'undefined' && link.data)
        link = link.data;

        if (this.deleteLinks) {
            for (let i = 0; i < this.deleteLinks.length; i++) {
                if (this.deleteLinks[i].id === link.id)
                    return;
            }
        }

        if (link instanceof go.Link)
            return;

        link = diagramDataToJson(link);

        for (let i = 0; i < this.updateLinks.length; i++) {
            if (this.updateLinks[i].id === link.id) {
                this.updateLinks[i] = link;
                return;
            }
        }
        this.updateLinks.push(link);
    };

    deleteLink = (link_id:string) => {

        for (let i = 0; i < this.deleteLinks.length; i++) {
            if (this.deleteLinks[i] === link_id) {
                return;
            }
        }
        this.deleteLinks.push(link_id);
    };

    addNodeWithLinks = (node:any) => {
        if (node.data) {
            this.addNode(node.data);
            let links = node.linksConnected;
            while (links.next()) {
                this.addLink(links.value.data);
            }
        }
    };
    
}

export function exportDiagram(dg: go.Diagram, mimeType:string, basefilename:string, scale:string) {


    let blobCallback = function (blob:any) {
        let url = window.URL.createObjectURL(blob);
        let filename = basefilename + '-' + (new Date()).toISOString().slice(0, 19).replace(/[TZ:]/g, '-') + "." + mimeType.replace('image/', '');

        let a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;

        // IE 11
        if ((window.navigator as any).msSaveBlob !== undefined) {
            (window.navigator as any).msSaveBlob(blob, filename);
            return;
        }

        document.body.appendChild(a);
        requestAnimationFrame(() => {
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    };

    if (mimeType === 'image/svg') {
        let svg = dg.makeSvg({ scale: parseFloat(scale), background: "white" });
        if (svg) {
            let svgstr = new XMLSerializer().serializeToString(svg);
            let blob = new Blob([svgstr], { type: "image/svg+xml" });
            blobCallback(blob);
        }
    } else {
        dg.makeImageData({ scale: parseFloat(scale), maxSize: new go.Size(30000, 30000), background: '#ffffff', type: mimeType, returnType: 'blob', callback: blobCallback });
    }
}