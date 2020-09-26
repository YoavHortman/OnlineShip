"use strict";
function isNull(b2Object) {
    return b2Object.a === 0;
}
function createChainShape(vertices, closedLoop) {
    var shape = new b2ChainShape();
    var buffer = box2D._malloc(vertices.length * 8);
    var offset = 0;
    for (var i = 0; i < vertices.length; i++) {
        box2D.HEAPF32[buffer + offset >> 2] = vertices[i].x;
        box2D.HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].y;
        offset += 8;
    }
    var ptr_wrapped = box2D.wrapPointer(buffer, b2Vec2);
    if (closedLoop)
        shape.CreateLoop(ptr_wrapped, vertices.length);
    else
        shape.CreateChain(ptr_wrapped, vertices.length);
    return shape;
}
var RigidBody = /** @class */ (function () {
    function RigidBody(body) {
        this.chains = [];
        this.body = body;
    }
    RigidBody.prototype.addChain = function (fixtureDef, vertices) {
        fixtureDef.set_shape(createChainShape(vertices, false));
        var fixture = this.body.CreateFixture(fixtureDef);
        var chain = new RigidBodyChain(vertices, fixture);
        this.chains.push(chain);
        return chain;
    };
    return RigidBody;
}());
var RigidBodyChain = /** @class */ (function () {
    function RigidBodyChain(vertices, fixture) {
        this.vertices = vertices;
        this.fixture = fixture;
    }
    return RigidBodyChain;
}());
//# sourceMappingURL=Box2DHelpers.js.map