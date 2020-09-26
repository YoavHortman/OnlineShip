declare var box2D: any;

function isNull(b2Object: b2Fixture | b2Body) {
  return (b2Object as any).a === 0;
}

function createChainShape(vertices: b2Vec2[], closedLoop: boolean): b2ChainShape {
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

class RigidBody {
  body: b2Body;
  chains: RigidBodyChain[] = [];
  constructor(body: b2Body) {
    this.body = body;
  }

  addChain(fixtureDef: b2FixtureDef, vertices: b2Vec2[],): RigidBodyChain {
    fixtureDef.set_shape(createChainShape(vertices, false));
    const fixture = this.body.CreateFixture(fixtureDef);

    const chain = new RigidBodyChain(vertices, fixture);
    this.chains.push(chain);
    return chain;
  }
}

class RigidBodyChain {
  vertices: b2Vec2[];
  fixture: b2Fixture;

  constructor(vertices: b2Vec2[], fixture: b2Fixture) {
    this.vertices = vertices;
    this.fixture = fixture;
  }
}