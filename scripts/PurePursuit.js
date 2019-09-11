
class PurePursuit extends PApplet{
    path = [];
    followerPath = [];

    follower;
    followerSpeed = 2.5;
    followerStopDistance = 2;

    lookaheadDistanceDelta = 2.5;

    pointSize = 4;

    lookaheadDistance = 45;

    pursuedCircleColor = [255, 0, 0];

    static main(passedArgs){
        PApplet.main(PurePursuit.class.getName());
    }

    settings(){
        size(800, 400);
    }

    setup(){
        colorMode(RGB);
        
        reset();
    }

    reset(){
        path = [];

        follower = null;
        followerPath = null;
    }

    draw(){
        background(255);

        // If there are any points on the follower's path
        if (followerPath != null) {
            // Iterate through all follower path points and draw them
            for (let i = 0; i < followerPath.size(); i+= 4) {

                // Coordinates of the point
                let pointCoords = followerPath[i];

                // If it isn't the first point, connect this point to its predecessor
                if (i > 0) {
                    // Coords of the previous point
                    let prevPointCoords = followerPath[i-1];

                    // Draw the line
                    stroke(120);
                    line(pointCoords[0], pointCoords[1], prevPointCoords[0], prevPointCoords[1]);
                }
            }
        }

        // Iterate through all path points and draw them
        for (let i = 0; i < path.size(); i++) {
            // Coordinates of the point
            let pointCoords = path[i];

            // Create an eclipse as the point
            stroke(0);
            fill(0);
            ellipse(pointCoords[0], pointCoords[1], pointSize, pointSize);

            // If it isn't the first point, connect this point to its predecessor
            if (i > 0) {
                // Coords of the previous point
                let prevPointCoords = [i - 1);

                // Draw the line
                line(pointCoords[0], pointCoords[1], prevPointCoords[0], prevPointCoords[1]);
            }
        }

        // If mouse was pressed, get the lookahead point
        if (mousePressed && mouseButton == LEFT) {
            let x = mouseX;
            let y = mouseY;

            // Get the lookahead point from the mouse coordinates
            let lookaheadPoint = getLookaheadPoint(x, y, lookaheadDistance);

            // If the function returned a valid point, draw it
            if (lookaheadPoint != null) drawLookaheadPoint(x, y, lookaheadPoint);
        }

        // Draw and potentially moves the PathFollower
        if (follower != null) {
            // Positions of the follower and its lookahead point
            let followerPosition = follower.getFollowerPosition();
            let lookaheadCoordinates = getLookaheadPoint(followerPosition, lookaheadDistance);

            // Draw the follower
            fill(0);
            ellipse(followerPosition[0], followerPosition[1], pointSize, pointSize);

            // If lookahead coordinates for the follower exist
            if (lookaheadCoordinates != null) {
                // To calculate the distance between the lookahead point and the follower
                let offsetLookaheadX = lookaheadCoordinates[0] - followerPosition[0];
                let offsetLookaheadY = lookaheadCoordinates[1] - followerPosition[1];

                // Draw the lookahead point
                drawLookaheadPoint(followerPosition, lookaheadCoordinates);

                // The distance from follower position to lookahead position
                let distance = 2 * Math.sqrt(Math.pow(lookaheadCoordinates[0] - followerPosition[0], 2) + Math.pow(lookaheadCoordinates[1] - followerPosition[1], 2));

                // Circle around the follower
                noFill();
                ellipse(followerPosition[0], followerPosition[1], distance, distance);

                // If the follower reached the destination, delete the follower
                if (Math.sqrt(offsetLookaheadX * offsetLookaheadX + offsetLookaheadY * offsetLookaheadY) < followerStopDistance) {
                    follower = null;
                } else {
                    // Move the follower upon pressing 'f'
                    if (keyPressed && key == 'f') {
                        // We need to create a new coordinate pair, because the position of the pathFollower changes
                        let tempFollowerPosition = follower.getFollowerPosition();

                        // Add new point to the follower's path and move the follower
                        followerPath.push( tempFollowerPosition);
                        follower.moveFollowerTowardsPoint(lookaheadCoordinates);
                    }
                }
            }
        }
    }

    getLookaheadPoint(point, lookaheadDistance){
        let lookaheadPoint = [];

        // Iterate through all the points
        for (let i = 0; i < path.size() - 1; i++) {
            // The path segment points
            let lineStartPoints = [i];
            let lineEndPoints = [i + 1];

            // Translated path segment and the mouse coordinates
            let translatedCoords = [ lineEndPoints[0] - lineStartPoints[0], lineEndPoints[1] - lineStartPoints[1] ];
            let translatedMouseCoords = [ x - lineStartPoints[0], y - lineStartPoints[1] ];

            // The angle to turn all coordinates by
            let angle = - Math.atan2(translatedCoords[1], translatedCoords[0]);

            // Translated and rotated path segment and the mouse coordinates
            let turnedCoords = [translatedCoords[0] * Math.cos(angle) - translatedCoords[1] * Math.sin(angle), 0 ];
            let turnedMouseCoords = [translatedMouseCoords[0] * Math.cos(angle) - translatedMouseCoords[1] * Math.sin(angle), translatedMouseCoords[1] * Math.cos(angle) + translatedMouseCoords[0] * Math.sin(angle) ];

            // The distance from the mouse's x coordinate above the line segment to the possible point on the line segment
            // Take note that if the segment is too far, the result of this operation wil be NaN (we can't create a  right triangle if a side is longer than a hypotenuse)
            let intersectingPointX = turnedMouseCoords[0] + Math.sqrt(lookaheadDistance * lookaheadDistance - turnedMouseCoords[1] * turnedMouseCoords[1]);

            // If the point lays on the translated and rotated segment
            if ((intersectingPointX > 0) && (intersectingPointX < turnedCoords[0])) {
                lookaheadPoint = [  
                    intersectingPointX * cos(-angle) + lineStartPoints[0],
                    intersectingPointX * sin(-angle) + lineStartPoints[1]
                ];
            }
        }

        // Do we even have any points to draw? If we do, attempt to do so.
        if (path.size() > 0) {
            // If the mouse is close enough to the end, simply select that as the pursuit target
            let endPointCoordinates = path[path.size() - 1];

            let endX = endPointCoordinates[0];
            let endY = endPointCoordinates[1];

            if (Math.sqrt((endX - x) * (endX - x) + (endY - y) * (endY - y)) <= lookaheadDistance) {
                lookaheadPoint = [ endX, endY ];
            }

            // If we selected any points to pursue, draw them.
            if (lookaheadPoint[0] != 0 && lookaheadPoint[1] != 0) {
                return lookaheadPoint;
            }
        }

        return null;
    }

    drawLookaheadPoint(point1, point2) {

        // Line between object and lookahead point
        stroke(0);
        line(point1[0], point1[1], point2[0], point2[1]);

        // Fill the circle with the desired color of the point to be pursued
        fill(pursuedCircleColor[0], pursuedCircleColor[1], pursuedCircleColor[2]);

        // Lookahead point
        ellipse(point2[0], point2[1], pointSize, pointSize);
    }

    keyPressed() {
        //Reset the game
        if (key == 'r') reset();

        // Create a new follower object at the beginning of the path
        if (key == 'n' && path.size() > 0) {
            let firstPointCoordinates = path[0];

            followerPath = [];
            follower = new PathFollower(firstPointCoordinates[0], firstPointCoordinates[1], followerSpeed);
        }

        // Increase lookahead distance
        if (key == '+') lookaheadDistance += lookaheadDistanceDelta;

        // Decreased lookahead distance
        if (key == '-') lookaheadDistance -= lookaheadDistanceDelta;
    }

    mousePressed() {
        // Add a new path point
        if (mouseButton == RIGHT) path.push( mouseX, mouseY );
    }
    
};