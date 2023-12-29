import * as go from 'gojs';

go.Shape.defineFigureGenerator("RoundedRectangleWithHeader", function(shape, w, h) {
    // this figure takes one parameter, the size of the corner
    var p1 = 5;  // default corner size
    if (shape !== null) {
        var param1 = shape.parameter1;
        if (!isNaN(param1) && param1 >= 0) p1 = param1;  // can't be negative or NaN
    }
    var p2 = 5;
    if (shape !== null) {
        var param2 = shape.parameter2;
        if (!isNaN(param2) && param2 >= 0) p2 = param2;
    }
    var geo = new go.Geometry();
    // a single figure consisting of straight lines and quarter-circle arcs
    geo.add(new go.PathFigure(0, p1, true)
        .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
        .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
        .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
        .add(new go.PathSegment(go.PathSegment.Line, w, h - p2))
        .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w-p2, h-p2, p2, p2))
        .add(new go.PathSegment(go.PathSegment.Line, p2, h))
        .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, p2, h-p2, p2, p2).close()));
    
    geo.spot1 = new go.Spot(0, 0, 0, 0);
    geo.spot2 = new go.Spot(1, 1, 0, 0);

    return geo;
});

go.Shape.defineFigureGenerator("RoundedTopRectangle", function(shape, w, h) {
    // this figure takes one parameter, the size of the corner
    var p1 = 5;  // default corner size
    if (shape !== null) {
        var param1 = shape.parameter1;
        if (!isNaN(param1) && param1 >= 0) p1 = param1;  // can't be negative or NaN
    }
    var geo = new go.Geometry();
    // a single figure consisting of straight lines and quarter-circle arcs
    geo.add(new go.PathFigure(0, p1)
        .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
        .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
        .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
        .add(new go.PathSegment(go.PathSegment.Line, w, h))
        .add(new go.PathSegment(go.PathSegment.Line, 0, h).close()));
    // don't intersect with two top corners when used in an "Auto" Panel
    geo.spot1 = new go.Spot(0, 0, 0, 0);
    geo.spot2 = new go.Spot(1, 1, 0, 0);
    return geo;
});

go.Shape.defineFigureGenerator("RoundedBottomRectangle", function(shape, w, h) {
    // this figure takes one parameter, the size of the corner
    var p1 = 5;  // default corner size
    if (shape !== null) {
        var param1 = shape.parameter1;
        if (!isNaN(param1) && param1 >= 0) p1 = param1;  // can't be negative or NaN
    }
    p1 = Math.min(p1, w / 2);
    p1 = Math.min(p1, h / 2);  // limit by whole height or by half height?
    var geo = new go.Geometry();
    // a single figure consisting of straight lines and quarter-circle arcs
    geo.add(new go.PathFigure(0, 0)
        .add(new go.PathSegment(go.PathSegment.Line, w, 0))
        .add(new go.PathSegment(go.PathSegment.Line, w, h - p1))
        .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1))
        .add(new go.PathSegment(go.PathSegment.Line, p1, h))
        .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, p1, h - p1, p1, p1).close()));
    // don't intersect with two bottom corners when used in an "Auto" Panel
    geo.spot1 = new go.Spot(0, 0, 0, 0);
    geo.spot2 = new go.Spot(1, 1, 0, 0);
    return geo;
});

go.Shape.defineFigureGenerator("ExpandedLine", (shape, w, h) => {
    return new go.Geometry()
        .add(new go.PathFigure(0, 0.25*h, false)
            .add(new go.PathSegment(go.PathSegment.Line, .5 * w, 0.75*h))
            .add(new go.PathSegment(go.PathSegment.Line, w, 0.25*h)));
});

// use a sideways V figure instead of PlusLine in the TreeExpanderButton
go.Shape.defineFigureGenerator("CollapsedLine", (shape, w, h) => {
    return new go.Geometry()
        .add(new go.PathFigure(0.25*w, 0, false)
            .add(new go.PathSegment(go.PathSegment.Line, 0.75*w, .5 * h))
            .add(new go.PathSegment(go.PathSegment.Line, 0.25*w, h)));
});
