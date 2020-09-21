declare class b2Vec2 {
  /**
  * x value
  **/
  public x: number;

  /**
  * y value
  **/
  public y: number;

  /**
  * Creates a new vector 2.
  * @x x value, default = 0.
  * @y y value, default = 0.
  **/
  constructor(x?: number, y?: number);

  /**
  * Sets x and y to absolute values.
  **/
  public Abs(): void;

  /**
  * Adds the vector 2 to this vector 2.  The result is stored in this vector 2.
  * @v Vector 2 to add.
  **/
  public Add(v: b2Vec2): void;

  /**
  * Creates a copy of the vector 2.
  * @return Copy of this vector 2.
  **/
  public Copy(): b2Vec2;

  /**
  * Cross F V
  * @s
  **/
  public CrossFV(s: number): void;

  /**
  * Cross V F
  * @s
  **/
  public CrossVF(s: number): void;

  /**
  * Gets the negative of this vector 2.
  * @return Negative copy of this vector 2.
  **/
  public GetNegative(): b2Vec2;

  /**
  * True if the vector 2 is valid, otherwise false.  A valid vector has finite values.
  * @return True if the vector 2 is valid, otherwise false.
  **/
  public IsValid(): boolean;

  /**
  * Calculates the length of the vector 2.
  * @return The length of the vector 2.
  **/
  public Length(): number;

  /**
  * Calculates the length squared of the vector2.
  * @return The length squared of the vector 2.
  **/
  public LengthSquared(): number;

  /**
  * Creates a new vector 2 from the given values.
  * @x x value.
  * @y y value.
  **/
  public static Make(x: number, y: number): b2Vec2;

  /**
  * Calculates which vector has the maximum values and sets this vector to those values.
  * @b Vector 2 to compare for maximum values.
  **/
  public MaxV(b: b2Vec2): void;

  /**
  * Calculates which vector has the minimum values and sets this vector to those values.
  * @b Vector 2 to compare for minimum values.
  **/
  public MinV(b: b2Vec2): void;

  /**
  * Matrix multiplication.  Stores the result in this vector 2.
  * @A Matrix to muliply by.
  **/
  public MulM(A: b2Mat22): void;

  /**
  * Vector multiplication.  Stores the result in this vector 2.
  * @a Value to multiple the vector's values by.
  **/
  public Multiply(a: number): void;

  /**
  * Dot product multiplication.  Stores the result in this vector 2.
  * @A Matrix to multiply by.
  **/
  public MulTM(A: b2Mat22): void;

  /**
  * Sets this vector 2 to its negative.
  **/
  public NegativeSelf(): void;

  /**
  * Normalizes the vector 2 [0,1].
  * @return Length.
  **/
  public Normalize(): number;

  /**
  * Sets the vector 2.
  * @x x value, default is 0.
  * @y y value, default is 0.
  **/
  public Set(x?: number, y?: number): void;

  /**
  * Sets the vector 2 from a vector 2.
  * @v Vector 2 to copy values from.
  **/
  public SetV(v: b2Vec2): void;

  /**
  * Sets the vector 2 to zero values.
  **/
  public SetZero(): void;

  /**
  * Subtracts the vector 2 from this vector 2.  The result is stored in this vector 2.
  * @v Vector 2 to subtract.
  **/
  public Subtract(v: b2Vec2): void;
}

declare class b2Mat22 {

  /**
  * Column 1
  **/
  public col1: b2Vec2;

  /**
  * Column 2
  **/
  public col2: b2Vec2;

  /**
  * Empty constructor
  **/
  constructor();

  /**
  * Sets all internal matrix values to absolute values.
  **/
  public Abs(): void;

  /**
  * Adds the two 2x2 matricies together and stores the result in this matrix.
  * @m 2x2 matrix to add.
  **/
  public AddM(m: b2Mat22): void;

  /**
  * Creates a copy of the matrix.
  * @return Copy of this 2x2 matrix.
  **/
  public Copy(): b2Mat22;

  /**
  * Creates a rotation 2x2 matrix from the given angle.
  * R(theta) = [ cos(theta)  -sin(theta) ]
  *            [ sin(theta)   cos(theta) ]
  * @angle Matrix angle (theta).
  * @return 2x2 matrix.
  **/
  public static FromAngle(angle: number): b2Mat22;

  /**
  * Creates a 2x2 matrix from two columns.
  * @c1 Column 1 vector.
  * @c2 Column 2 vector.
  * @return 2x2 matrix.
  **/
  public static FromVV(c1: b2Vec2, c2: b2Vec2): b2Mat22;

  /**
  * Gets the rotation matrix angle.
  * R(theta) = [ cos(theta)  -sin(theta) ]
  *            [ sin(theta)   cos(theta) ]
  * @return The rotation matrix angle (theta).
  **/
  public GetAngle(): number;

  /**
  * Compute the inverse of this matrix, such that inv(A) A = identity.
  * @out Inverse matrix.
  * @return Inverse matrix.
  **/
  public GetInverse(out: b2Mat22): b2Mat22;

  /**
  * Sets the 2x2 rotation matrix from the given angle.
  * R(theta) = [ cos(theta)  -sin(theta) ]
  *            [ sin(theta)   cos(theta) ]
  * @angle Matrix angle (theta).
  **/
  public Set(angle: number): void;

  /**
  * Sets the 2x2 matrix to identity.
  **/
  public SetIdentity(): void;

  /**
  * Sets the 2x2 matrix from a 2x2 matrix.
  * @m 2x2 matrix values.
  **/
  public SetM(m: b2Mat22): void;

  /**
  * Sets the 2x2 matrix from 2 column vectors.
  * @c1 Column 1 vector.
  * @c2 Column 2 vector.
  **/
  public SetVV(c1: b2Vec2, c2: b2Vec2): void;

  /**
  * Sets the 2x2 matrix to all zeros.
  **/
  public SetZero(): void;

  /**
  * TODO, has something to do with the determinant
  * @out Solved vector
  * @bX
  * @bY
  * @return Solved vector
  **/
  public Solve(out: b2Vec2, bX: number, bY: number): b2Vec2;
}


/**
* A body definition holds all the data needed to construct a rigid body. You can safely re-use body definitions.
**/
declare class b2BodyDef {
  public set_type(def: BodyDefType): void;
  /**
  * Does this body start out active?
  **/
  public active: boolean;

  /**
  * Set this flag to false if this body should never fall asleep. Note that this increases CPU usage.
  **/
  public allowSleep: boolean;

  /**
  * The world angle of the body in radians.
  **/
  public angle: number;

  /**
  * Angular damping is use to reduce the angular velocity. The damping parameter can be larger than 1.0f but the damping effect becomes sensitive to the time step when the damping parameter is large.
  **/
  public angularDamping: number;

  /**
  * The angular velocity of the body.
  **/
  public angularVelocity: number;

  /**
  * Is this body initially awake or sleeping?
  **/
  public awake: boolean;

  /**
  * Is this a fast moving body that should be prevented from tunneling through other moving bodies? Note that all bodies are prevented from tunneling through static bodies.
  * @warning You should use this flag sparingly since it increases processing time.
  **/
  public bullet: boolean;

  /**
  * Should this body be prevented from rotating? Useful for characters.
  **/
  public fixedRotation: boolean;

  /**
  * Scales the inertia tensor.
  * @warning Experimental
  **/
  public inertiaScale: number;

  /**
  * Linear damping is use to reduce the linear velocity. The damping parameter can be larger than 1.0f but the damping effect becomes sensitive to the time step when the damping parameter is large.
  **/
  public linearDamping: number;

  /**
  * The linear velocity of the body's origin in world co-ordinates.
  **/
  public linearVelocity: b2Vec2;

  /**
  * The world position of the body. Avoid creating bodies at the origin since this can lead to many overlapping shapes.
  **/
  public position: b2Vec2;

  /**
  * The body type: static, kinematic, or dynamic. A member of the b2BodyType class .
  * @note If a dynamic body would have zero mass, the mass is set to one.
  **/
  public type: number;



  /**
  * Use this to store application specific body data.
  **/
  public userData: any;
}

declare class b2World {
  constructor(gravity: b2Vec2, doSleep: boolean);
  // public AddController(c: Controllers.b2Controller): Controllers.b2Controller;
  public ClearForces(): void;
  public CreateBody(def: b2BodyDef): b2Body;
  // public CreateJoint(def: Joints.b2JointDef): Joints.b2Joint;
  public DestroyBody(b: b2Body): void;
  // public DestroyController(controller: Controllers.b2Controller): void;
  // public DestroyJoint(j: Joints.b2Joint): void;
  public DrawDebugData(): void;
  // public DrawJoint(j: Joints.b2Joint): void;
  // public DrawShape(shape: b2Shapes.b2Shape, xf: b2Transform, color: b2Common.b2Color): void;
  public GetBodyCount(): number;
  public GetBodyList(): b2Body;
  public GetContactCount(): number;
  public GetGravity(): b2Vec2;
  public GetGroundBody(): b2Body;
  public GetJointCount(): number;
  // public GetJointList(): Joints.b2Joint;
  public GetPairCount(): number;
  public GetProxyCount(): number;
  public IsLocked(): boolean;
  // public Query(aabb: b2Collision.b2AABB, shapes: any[], maxCount: number): number;
  public Raycast(callback: Function, point1: b2Vec2, point2: b2Vec2): void;
  public RaycastAll(point1: b2Vec2, point2: b2Vec2): any[];
  // public RaycastOne(point1: b2Vec2, point2: b2Vec2): b2Fixture;
  // public RemoveController(c: Controllers.b2Controller): void;
  // public SetBroadPhase(broadPhase: b2Collision.IBroadPhase): void;
  public SetContactListener(listener: any): void;
  public SetContinuousPhysics(flag: boolean): void;
  // public SetDebugDraw(debugDraw: b2DebugDraw): void;
  public SetDestructionListener(listener: any): void;
  public SetGravity(gravity: b2Vec2): void;
  public SetWarmStarting(flag: boolean): void;
  public Step(dt: number, velocityIterations: number, positionIterations: number): void;
  public Validate(): void;
}


declare class b2Body {

  /**
  * Dynamic Body
  **/
  public static b2_dynamicBody: number;

  /**
  * Kinematic Body
  **/
  public static b2_kinematicBody: number;

  /**
  * Static Body
  **/
  public static b2_staticBody: number;

  /**
  * Apply a force at a world point. If the force is not applied at the center of mass, it will generate a torque and affect the angular velocity. This wakes up the body.
  * @force The world force vector, usually in Newtons (N).
  * @point The world position of the point of application.
  **/
  public ApplyForce(force: b2Vec2, point: b2Vec2): void;

  /**
  * Apply an impulse at a point. This immediately modifies the velocity. It also modifies the angular velocity if the point of application is not at the center of mass. This wakes up the body.
  * @impules The world impulse vector, usually in N-seconds or kg-m/s.
  * @point The world position of the point of application.
  **/
  public ApplyImpulse(impulse: b2Vec2, point: b2Vec2): void;

  /**
  * Apply a torque. This affects the angular velocity without affecting the linear velocity of the center of mass. This wakes up the body.
  * @torque Force applied about the z-axis (out of the screen), usually in N-m.
  **/
  public ApplyTorque(torque: number): void;

  /**
  * Creates a fixture and attach it to this body. Use this function if you need to set some fixture parameters, like friction. Otherwise you can create the fixture directly from a shape. If the density is non-zero, this function automatically updates the mass of the body. Contacts are not created until the next time step.
  * @warning This function is locked during callbacks.
  * @def The fixture definition;
  * @return The created fixture.
  **/
  public CreateFixture(def: b2FixtureDef): b2Fixture;

  /**
  * Creates a fixture from a shape and attach it to this body. This is a convenience function. Use b2FixtureDef if you need to set parameters like friction, restitution, user data, or filtering. This function automatically updates the mass of the body.
  * @warning This function is locked during callbacks.
  * @shape The shaped of the fixture (to be cloned).
  * @density The shape density, default is 0.0, set to zero for static bodies.
  * @return The created fixture.
  **/
  public CreateFixture(shape: b2Shape, density?: number): b2Fixture;

  /**
  * Destroy a fixture. This removes the fixture from the broad-phase and destroys all contacts associated with this fixture. This will automatically adjust the mass of the body if the body is dynamic and the fixture has positive density. All fixtures attached to a body are implicitly destroyed when the body is destroyed.
  * @warning This function is locked during callbacks.
  * @fixture The fixed to be removed.
  **/
  public DestroyFixture(fixture: b2Fixture): void;

  /**
  * Get the angle in radians.
  * @return The current world rotation angle in radians
  **/
  public GetAngle(): number;

  /**
  * Get the angular damping of the body.
  * @return Angular damping of the body.
  **/
  public GetAngularDamping(): number;

  /**
  * Get the angular velocity.
  * @return The angular velocity in radians/second.
  **/
  public GetAngularVelocity(): number;

  /**
  * Get the list of all contacts attached to this body.
  * @return List of all contacts attached to this body.
  **/
  // public GetContactList(): Contacts.b2ContactEdge;

  /**
  * Get the list of all controllers attached to this body.
  * @return List of all controllers attached to this body.
  **/
  // public GetControllerList(): Controllers.b2ControllerEdge;

  /**
  * Get the definition containing the body properties.
  * @note This provides a feature specific to this port.
  * @return The body's definition.
  **/
  public GetDefinition(): b2BodyDef;

  /**
  * Get the list of all fixtures attached to this body.
  * @return List of all fixtures attached to this body.
  **/
  public GetFixtureList(): b2Fixture;

  /**
  * Get the central rotational inertia of the body.
  * @return The rotational inertia, usually in kg-m^2.
  **/
  public GetInertia(): number;

  /**
  * Get the list of all joints attached to this body.
  * @return List of all joints attached to this body.
  **/
  // public GetJointList(): Joints.b2JointEdge;

  /**
  * Get the linear damping of the body.
  * @return The linear damping of the body.
  **/
  public GetLinearDamping(): number;

  /**
  * Get the linear velocity of the center of mass.
  * @return The linear velocity of the center of mass.
  **/
  public GetLinearVelocity(): b2Vec2;

  /**
  * Get the world velocity of a local point.
  * @localPoint Point in local coordinates.
  * @return The world velocity of the point.
  **/
  public GetLinearVelocityFromLocalPoint(localPoint: b2Vec2): b2Vec2;

  /**
  * Get the world linear velocity of a world point attached to this body.
  * @worldPoint Point in world coordinates.
  * @return The world velocity of the point.
  **/
  public GetLinearVelocityFromWorldPoint(worldPoint: b2Vec2): b2Vec2;

  /**
  * Get the local position of the center of mass.
  * @return Local position of the center of mass.
  **/
  public GetLocalCenter(): b2Vec2;

  /**
  * Gets a local point relative to the body's origin given a world point.
  * @worldPoint Pointin world coordinates.
  * @return The corresponding local point relative to the body's origin.
  **/
  public GetLocalPoint(worldPoint: b2Vec2): b2Vec2;

  /**
  * Gets a local vector given a world vector.
  * @worldVector World vector.
  * @return The corresponding local vector.
  **/
  public GetLocalVector(worldVector: b2Vec2): b2Vec2;

  /**
  * Get the total mass of the body.
  * @return The body's mass, usually in kilograms (kg).
  **/
  public GetMass(): number;

  /**
  * Get the mass data of the body. The rotational inertial is relative to the center of mass.
  * @data Body's mass data, this argument is `out`.
  **/
  // public GetMassData(data: b2Shapes.b2MassData): void;

  /**
  * Get the next body in the world's body list.
  * @return Next body in the world's body list.
  **/
  public GetNext(): b2Body;

  /**
  * Get the world body origin position.
  * @return World position of the body's origin.
  **/
  public GetPosition(): b2Vec2;

  /**
  * Get the body transform for the body's origin.
  * @return World transform of the body's origin.
  **/
  public GetTransform(): b2Transform;

  /**
  * Get the type of this body.
  * @return Body type as uint.
  **/
  public GetType(): number;

  /**
  * Get the user data pointer that was provided in the body definition.
  * @return User's data, cast to the correct type.
  **/
  public GetUserData(): any;

  /**
  * Get the parent world of this body.
  * @return Body's world.
  **/
  public GetWorld(): b2World;

  /**
  * Get the world position of the center of mass.
  * @return World position of the center of mass.
  **/
  public GetWorldCenter(): b2Vec2;

  /**
  * Get the world coordinates of a point given the local coordinates.
  * @localPoint Point on the body measured relative to the body's origin.
  * @return localPoint expressed in world coordinates.
  **/
  public GetWorldPoint(localPoint: b2Vec2): b2Vec2;

  /**
  * Get the world coordinates of a vector given the local coordinates.
  * @localVector Vector fixed in the body.
  * @return localVector expressed in world coordinates.
  **/
  public GetWorldVector(localVector: b2Vec2): b2Vec2;

  /**
  * Get the active state of the body.
  * @return True if the body is active, otherwise false.
  **/
  public IsActive(): boolean;

  /**
  * Get the sleeping state of this body.
  * @return True if the body is awake, otherwise false.
  **/
  public IsAwake(): boolean;

  /**
  * Is the body treated like a bullet for continuous collision detection?
  * @return True if the body is treated like a bullet, otherwise false.
  **/
  public IsBullet(): boolean;

  /**
  * Does this body have fixed rotation?
  * @return True for fixed, otherwise false.
  **/
  public IsFixedRotation(): boolean;

  /**
  * Is this body allowed to sleep?
  * @return True if the body can sleep, otherwise false.
  **/
  public IsSleepingAllowed(): boolean;

  /**
  * Merges another body into this. Only fixtures, mass and velocity are effected, Other properties are ignored.
  * @note This provides a feature specific to this port.
  **/
  public Merge(other: b2Body): void;

  /**
  * This resets the mass properties to the sum of the mass properties of the fixtures. This normally does not need to be called unless you called SetMassData to override the mass and later you want to reset the mass.
  **/
  public ResetMassData(): void;

  /**
  * Set the active state of the body. An inactive body is not simulated and cannot be collided with or woken up. If you pass a flag of true, all fixtures will be added to the broad-phase. If you pass a flag of false, all fixtures will be removed from the broad-phase and all contacts will be destroyed. Fixtures and joints are otherwise unaffected. You may continue to create/destroy fixtures and joints on inactive bodies. Fixtures on an inactive body are implicitly inactive and will not participate in collisions, ray-casts, or queries. Joints connected to an inactive body are implicitly inactive. An inactive body is still owned by a b2World object and remains in the body list.
  * @flag True to activate, false to deactivate.
  **/
  public SetActive(flag: boolean): void;

  /**
  * Set the world body angle
  * @angle New angle of the body.
  **/
  public SetAngle(angle: number): void;

  /**
  * Set the angular damping of the body.
  * @angularDamping New angular damping value.
  **/
  public SetAngularDamping(angularDamping: number): void;

  /**
  * Set the angular velocity.
  * @omega New angular velocity in radians/second.
  **/
  public SetAngularVelocity(omega: number): void;

  /**
  * Set the sleep state of the body. A sleeping body has vety low CPU cost.
  * @flag True to set the body to awake, false to put it to sleep.
  **/
  public SetAwake(flag: boolean): void;

  /**
  * Should this body be treated like a bullet for continuous collision detection?
  * @flag True for bullet, false for normal.
  **/
  public SetBullet(flag: boolean): void;

  /**
  * Set this body to have fixed rotation. This causes the mass to be reset.
  * @fixed True for no rotation, false to allow for rotation.
  **/
  public SetFixedRotation(fixed: boolean): void;

  /**
  * Set the linear damping of the body.
  * @linearDamping The new linear damping for this body.
  **/
  public SetLinearDamping(linearDamping: number): void;

  /**
  * Set the linear velocity of the center of mass.
  * @v New linear velocity of the center of mass.
  **/
  public SetLinearVelocity(v: b2Vec2): void;

  /**
  * Set the mass properties to override the mass properties of the fixtures Note that this changes the center of mass position. Note that creating or destroying fixtures can also alter the mass. This function has no effect if the body isn't dynamic.
  * @warning The supplied rotational inertia should be relative to the center of mass.
  * @massData New mass data properties.
  **/
  // public SetMassData(massData: b2Shapes.b2MassData): void;

  /**
  * Is this body allowed to sleep
  * @flag True if the body can sleep, false if not.
  **/
  public SetSleepingAllowed(flag: boolean): void;

  /**
  * Set the position of the body's origin and rotation (radians). This breaks any contacts and wakes the other bodies. Note this is less efficient than the other overload - you should use that if the angle is available.
  * @xf Body's origin and rotation (radians).
  **/
  public SetTransform(xf: b2Transform): void;

  /**
  * Set the type of this body. This may alter the mass and velocity
  * @type Type enum.
  **/
  public SetType(type: number): void;

  /**
  * Set the user data. Use this to store your application specific data.
  * @data The user data for this body.
  **/
  public SetUserData(data: any): void;

  /**
  * Splits a body into two, preserving dynamic properties
  * @note This provides a feature specific to this port.
  * @return The newly created bodies from the split.
  **/
  public Split(callback: (fixture: b2Fixture) => boolean): b2Body;
}
declare class b2FixtureDef {
  public density: number;
  public filter: any;
  public friction: number;
  public isSensor: boolean;
  public restitution: number;
  public shape: any;  // Polymorphism seems broken right now, so not using b2Shape
  public userData: any;

  public set_shape(shape: b2Shape): void;

  constructor();
}


declare class b2Fixture {
  constructor();

  // public GetAABB(): b2Collision.b2AABB;
  public GetBody(): b2Body;
  public GetDensity(): number;
  public GetFilterData(): any;
  public GetFriction(): number;
  // public GetMassData(massData?: b2Shapes.b2MassData): b2Shapes.b2MassData;
  public GetNext(): b2Fixture;
  public GetRestitution(): number;
  // public GetShape: b2Shapes.b2Shape;
  public GetType(): number;
  public GetUserData(): any;
  public IsSensor(): boolean;
  // public RayCast(output: b2Collision.b2RayCastOutput, input: b2Collision.b2RayCastInput): boolean;
  public SetDensity(density: number): void;
  public SetFilterData(filter: any): void;
  public setFriction(friction: number): void;
  public SetRestitution(restitution: number): void;
  public setSensor(sensor: boolean): void;
  public setUserData(data: any): void;
  public TestPoint(p: b2Vec2): boolean;
}
declare class BodyDefType {
}
declare const b2_dynamicBody: BodyDefType;
declare const b2_kinematicBody: BodyDefType;
declare const b2_staticBody: BodyDefType;


/**
* A shape is used for collision detection. Shapes are created in b2Body. You can use shape for collision detection before they are attached to the world.
* Warning: you cannot reuse shapes.
**/
declare class b2Shape {

  /**
  * Return value for TestSegment indicating a hit.
  **/
  public static e_hitCollide: number;

  /**
  * Return value for TestSegment indicating a miss.
  **/
  public static e_missCollide: number;

  /**
  * Return value for TestSegment indicating that the segment starting point, p1, is already inside the shape.
  **/
  public static startsInsideCollide: number;

  // Note: these enums are public in the source but no referenced by the documentation
  public static e_unknownShape: number;
  public static e_circleShape: number;
  public static e_polygonShape: number;
  public static e_edgeShape: number;
  public static e_shapeTypeCount: number;

  /**
  * Creates a new b2Shape.
  **/
  constructor();

  /**
  * Given a transform, compute the associated axis aligned bounding box for this shape.
  * @aabb Calculated AABB, this argument is `out`.
  * @xf Transform to calculate the AABB.
  **/
  // public ComputeAABB(aabb: b2AABB, xf: b2Transform): void;

  /**
  * Compute the mass properties of this shape using its dimensions and density. The inertia tensor is computed about the local origin, not the centroid.
  * @massData Calculate the mass, this argument is `out`.
  **/
  // public ComputeMass(massData: b2MassData, density: number): void;

  /**
  * Compute the volume and centroid of this shape intersected with a half plane
  * @normal The surface normal.
  * @offset The surface offset along the normal.
  * @xf The shape transform.
  * @c The centroid, this argument is `out`.
  **/
  public ComputeSubmergedArea(
    normal: b2Vec2,
    offset: number,
    xf: b2Transform,
    c: b2Vec2): number;

  /**
  * Clone the shape.
  **/
  public Copy(): b2Shape;

  /**
  * Get the type of this shape. You can use this to down cast to the concrete shape.
  **/
  public GetType(): number;

  /**
  * Cast a ray against this shape.
  * @output Ray cast results, this argument is `out`.
  * @input Ray cast input parameters.
  * @transform The transform to be applied to the shape.
  * @return True if the ray hits the shape, otherwise false.
  **/
  // public RayCast(
  // 	output: b2RayCastOutput,
  // 	input: b2RayCastInput,
  // 	transform: b2Transform): bool;

  /**
  * Set the shape values from another shape.
  * @other The other shape to copy values from.
  **/
  public Set(other: b2Shape): void;

  /**
  * Test if two shapes overlap with the applied transforms.
  * @shape1 shape to test for overlap with shape2.
  * @transform1 shape1 transform to apply.
  * @shape2 shape to test for overlap with shape1.
  * @transform2 shape2 transform to apply.
  * @return True if shape1 and shape2 overlap, otherwise false.
  **/
  // public static TestOverlap(
  // 	shape1: b2Shape,
  // 	transform1: b2Transform,
  // 	shape2: b2Shape,
  // 	transform2: b2Transform): bool;

  /**
  * Test a point for containment in this shape. This only works for convex shapes.
  * @xf Shape world transform.
  * @p Point to test against, in world coordinates.
  * @return True if the point is in this shape, otherwise false.
  **/
  public TestPoint(xf: b2Transform, p: b2Vec2): boolean;
}


/**
  * A circle shape.
  **/
declare class b2CircleShape extends b2Shape {

  /**
  * Creates a new circle shape.
  **/
  constructor(radius?: number);

  set_m_radius(radius: number): void;

  /**
  * Given a transform, compute the associated axis aligned bounding box for this shape.
  * @aabb Calculated AABB, this argument is `out`.
  * @xf Transform to calculate the AABB.
  **/
  // public ComputeAABB(aabb: b2AABB, xf: b2Transform): void;

  /**
  * Compute the mass properties of this shape using its dimensions and density. The inertia tensor is computed about the local origin, not the centroid.
  * @massData Calculate the mass, this argument is `out`.
  **/
  // public ComputeMass(massData: b2MassData, density: number): void;

  /**
  * Compute the volume and centroid of this shape intersected with a half plane
  * @normal The surface normal.
  * @offset The surface offset along the normal.
  * @xf The shape transform.
  * @c The centroid, this argument is `out`.
  **/
  public ComputeSubmergedArea(
    normal: b2Vec2,
    offset: number,
    xf: b2Transform,
    c: b2Vec2): number;

  /**
  * Copies the circle shape.
  * @return Copy of this circle shape.
  **/
  public Copy(): b2CircleShape;

  /**
  * Get the local position of this circle in its parent body.
  * @return This circle's local position.
  **/
  public GetLocalPosition(): b2Vec2;

  /**
  * Get the radius of the circle.
  * @return This circle's radius.
  **/
  public GetRadius(): number;

  /**
  * Cast a ray against this shape.
  * @output Ray cast results, this argument is `out`.
  * @input Ray cast input parameters.
  * @transform The transform to be applied to the shape.
  * @return True if the ray hits the shape, otherwise false.
  **/
  // public RayCast(
  // 	output: b2RayCastOutput,
  // 	input: b2RayCastInput,
  // 	transform: b2Transform): boolean;

  /**
  * Set the circle shape values from another shape.
  * @other The other circle shape to copy values from.
  **/
  public Set(other: b2CircleShape): void;

  /**
  * Set the local position of this circle in its parent body.
  * @position The new local position of this circle.
  **/
  public SetLocalPosition(position: b2Vec2): void;

  /**
  * Set the radius of the circle.
  * @radius The new radius of the circle.
  **/
  public SetRadius(radius: number): void;

  /**
  * Test a point for containment in this shape. This only works for convex shapes.
  * @xf Shape world transform.
  * @p Point to test against, in world coordinates.
  * @return True if the point is in this shape, otherwise false.
  **/
  public TestPoint(xf: b2Transform, p: b2Vec2): boolean;
}

/**
* An edge shape.
**/
declare class b2EdgeShape extends b2Shape {

  /**
  * Creates a new edge shape.
  **/
  constructor(v1: b2Vec2, v2: b2Vec2);
  constructor();

  public Set(other: b2Shape): void;
  public Set(v1: b2Vec2, v2: b2Vec2): void;

  /**
  * Given a transform, compute the associated axis aligned bounding box for this shape.
  * @aabb Calculated AABB, this argument is `out`.
  * @xf Transform to calculate the AABB.
  **/
  // public ComputeAABB(aabb: b2AABB, xf: b2Transform): void;

  /**
  * Compute the mass properties of this shape using its dimensions and density. The inertia tensor is computed about the local origin, not the centroid.
  * @massData Calculate the mass, this argument is `out`.
  **/
  // public ComputeMass(massData: b2MassData, density: number): void;

  /**
  * Compute the volume and centroid of this shape intersected with a half plane
  * @normal The surface normal.
  * @offset The surface offset along the normal.
  * @xf The shape transform.
  * @c The centroid, this argument is `out`.
  **/
  public ComputeSubmergedArea(
    normal: b2Vec2,
    offset: number,
    xf: b2Transform,
    c: b2Vec2): number;

  /**
  * Get the distance from vertex1 to vertex2.
  * @return Distance from vertex1 to vertex2.
  **/
  public GetLength(): number;

  /**
  * Get the local position of vertex1 in the parent body.
  * @return Local position of vertex1 in the parent body.
  **/
  public GetVertex1(): b2Vec2;

  /**
  * Get the local position of vertex2 in the parent body.
  * @return Local position of vertex2 in the parent body.
  **/
  public GetVertex2(): b2Vec2;

  /**
  * Get a core vertex 1 in local coordinates.  These vertices represent a smaller edge that is used for time of impact.
  * @return core vertex 1 in local coordinates.
  **/
  public GetCoreVertex1(): b2Vec2;

  /**
  * Get a core vertex 2 in local coordinates.  These vertices represent a smaller edge that is used for time of impact.
  * @return core vertex 2 in local coordinates.
  **/
  public GetCoreVertex2(): b2Vec2;

  /**
  * Get a perpendicular unit vector, pointing from the solid side to the empty side.
  * @return Normal vector.
  **/
  public GetNormalVector(): b2Vec2;

  /**
  * Get a parallel unit vector, pointing from vertex 1 to vertex 2.
  * @return Vertex 1 to vertex 2 directional vector.
  **/
  public GetDirectionVector(): b2Vec2;

  /**
  * Returns a unit vector halfway between direction and previous direction.
  * @return Halfway unit vector between direction and previous direction.
  **/
  public GetCorner1Vector(): b2Vec2;

  /**
  * Returns a unit vector halfway between direction and previous direction.
  * @return Halfway unit vector between direction and previous direction.
  **/
  public GetCorner2Vector(): b2Vec2;

  /**
  * Determines if the first corner of this edge bends towards the solid side.
  * @return True if convex, otherwise false.
  **/
  public Corner1IsConvex(): boolean;

  /**
  * Determines if the second corner of this edge bends towards the solid side.
  * @return True if convex, otherwise false.
  **/
  public Corner2IsConvex(): boolean;

  /**
  * Get the first vertex and apply the supplied transform.
  * @return First vertex with xf transform applied.
  **/
  public GetFirstVertex(xf: b2Transform): b2Vec2;

  /**
  * Get the next edge in the chain.
  * @return Next edge shape or null if there is no next edge shape.
  **/
  public GetNextEdge(): b2EdgeShape;

  /**
  * Get the previous edge in the chain.
  * @return Previous edge shape or null if there is no previous edge shape.
  **/
  public GetPrevEdge(): b2EdgeShape;

  /**
  * Get the support point in the given world direction with the supplied transform.
  * @xf Transform to apply.
  * @dX X world direction.
  * @dY Y world direction.
  * @return Support point.
  **/
  public Support(xf: b2Transform, dX: number, dY: number): b2Vec2;

  /**
  * Cast a ray against this shape.
  * @output Ray cast results, this argument is `out`.
  * @input Ray cast input parameters.
  * @transform The transform to be applied to the shape.
  * @return True if the ray hits the shape, otherwise false.
  **/
  // public RayCast(
  // 	output: b2RayCastOutput,
  // 	input: b2RayCastInput,
  // 	transform: b2Transform): bool;

  /**
  * Test a point for containment in this shape. This only works for convex shapes.
  * @xf Shape world transform.
  * @p Point to test against, in world coordinates.
  * @return True if the point is in this shape, otherwise false.
  **/
  public TestPoint(xf: b2Transform, p: b2Vec2): boolean;
}

/**
* A transform contains translation and rotation. It is used to represent the position and orientation of rigid frames.
**/
declare class b2Transform {

  /**
  * Transform position.
  **/
  public position: b2Vec2;

  /**
  * Transform rotation.
  **/
  public R: b2Mat22;

  /**
  * The default constructor does nothing (for performance).
  * @pos Position
  * @r Rotation
  **/
  constructor(pos: b2Vec2, r: b2Mat22);

  /**
  * Calculate the angle that the rotation matrix represents.
  * @return Rotation matrix angle.
  **/
  public GetAngle(): number;

  /**
  * Initialize using a position vector and rotation matrix.
  * @pos Position
  * @r Rotation
  **/
  public Initialize(pos: b2Vec2, r: b2Mat22): void;

  /**
  * Sets the transfrom from a transfrom.
  * @x Transform to copy values from.
  **/
  public Set(x: b2Transform): void;

  /**
  * Set this to the identity transform.
  **/
  public SetIdentity(): void;
}
