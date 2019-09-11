class PathFollower{
    position = [0, 0];

    speed;

    constructor( point, speed ){
        this.position = [ point[0], point[1] ];

        this.speed = speed;
    }

    moveFollowerTowardsPoint( pointTowards ){
        // Offset the point
        let offsetX = xToMoveTowards - position[0];
        let offsetY = yToMoveTowards - position[1];

        // Normalize the vector
        let lengthToPoint = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        let normalizedPointX = offsetX / lengthToPoint;
        let normalizedPointY = offsetY / lengthToPoint;

        // Move towards the point at a certain speed
        this.position += [
            normalizedPointX * speed,
            normalizedPointY * speed
        ];
    }

    getFollowerPosition(){
        return this.position;
    }
}
