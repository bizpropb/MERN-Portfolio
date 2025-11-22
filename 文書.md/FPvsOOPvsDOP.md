# FP vs OOP vs DOP: A Pragmatic Assessment

## The Three Paradigms

### Object-Oriented Programming (OOP)
"Model the world as interacting objects with encapsulated state and behavior"

Classes, inheritance, polymorphism, encapsulation. Data and behavior are bundled together. The dominant paradigm taught in universities since the 90s.

### Functional Programming (FP)
"Build programs from composable pure functions that transform data"

Pure functions, immutability, composition. Data flows through transformations. No hidden state, no side effects.

### Data-Oriented Programming (DOP)
"Separate data from behavior. Keep data plain and transformable."

DOP treats data as first-class citizens - plain structures (objects, maps, arrays) without methods. Behavior lives in standalone functions that operate on this data. Unlike OOP, data isn't hidden inside objects. Unlike pure FP, it's pragmatic about mutation when needed.

**Key DOP principles:**
- Data is immutable (or treated as immutable)
- Data is represented with generic structures (not custom classes)
- Data is separate from behavior
- Data has a schema (validation at boundaries)

DOP is essentially what modern JavaScript/TypeScript developers do naturally: plain objects, separate functions, explicit transformations.

```javascript
// DOP style
const user = { name: "Alice", email: "alice@test.com", role: "admin" };

const updateEmail = (user, newEmail) => ({ ...user, email: newEmail });
const isAdmin = (user) => user.role === "admin";
const serialize = (user) => JSON.stringify(user);
```

This isn't just syntax - these are fundamentally different ways of thinking about software.

## The Lego vs Puzzle Piece Problem

### Functional Programming: Lego Bricks

Lego bricks are standardized. Any brick connects to any other brick. You can build anything, tear it down, rebuild differently. The pieces don't care what you're making.

```javascript
// Pure functions - work with any data
const double = x => x * 2;
const addOne = x => x + 1;
const toString = x => String(x);

// Compose freely
const result = toString(addOne(double(5))); // "11"
```

### OOP: Puzzle Pieces

OOP creates puzzle pieces - components that only fit with their specific partners. A `PrimaryButton` inherits from `ButtonBase` which implements `IClickable`. Try to use it somewhere else? Good luck.

```java
// Tightly coupled - only works in its specific context
public class PrimaryButton extends ButtonBase implements IClickable, IStyleable {
    @Override
    public void onClick(ClickEvent e) {
        // Can only be used where ButtonBase is expected
    }
}
```

**The fundamental problem**: OOP encourages building custom components when you should be building with standard parts.

## Inheritance: The Broken Promise

### What Inheritance Claims

"Reuse code by extending base classes. DRY principle achieved!"

### What Actually Happens

```java
class Animal {
    void speak() { }
}

class Dog extends Animal {
    @Override void speak() { System.out.println("Bark"); }
}

class Robot extends Animal {  // Wait, robots aren't animals
    @Override void speak() { System.out.println("Beep"); }
}

// Now you need:
class SpeakingThing { }  // New base class
class Animal extends SpeakingThing { }  // Restructure everything
class Robot extends SpeakingThing { }   // Breaking changes everywhere
```

One new requirement and your entire inheritance tree needs restructuring.

### The Functional Alternative

```javascript
// Just functions - no hierarchy
const dogSpeak = () => "Bark";
const robotSpeak = () => "Beep";
const catSpeak = () => "Meow";

// Need a speaking thing? Pass the function
function announce(speakFn) {
    console.log(speakFn());
}

announce(dogSpeak);   // Works
announce(robotSpeak); // Works
announce(() => "Custom sound"); // Also works
```

No inheritance. No restructuring. Just compose what you need.

## Polymorphism: The Swiss Army Confusion

### The Promise

"Same interface, different implementations! Flexibility!"

### The Reality

**Nobody can keep this straight.** And this is a simple example. Real codebases have dozens of polymorphic variants.

### The Mental Load Problem

Humans can hold about 7 items in working memory. Inheritance chains of 3-4 levels with multiple interfaces and polymorphic variants exceed this instantly. Nevermind the problem to tracing them all back.

```java
class PaymentProcessor extends AbstractProcessor
    implements IPayable, IRefundable, ILoggable, IAuditable {
    // Which method comes from where?
    // What does the base class do?
    // Which interface requires what?
}
```

To understand this class, you must understand:
- `AbstractProcessor` and its base classes
- All four interfaces
- How they interact
- What's overridden where

### Functional Equivalent

```javascript
const processPayment = (payment) => { /* process */ };
const refundPayment = (payment) => { /* refund */ };
const logAction = (action) => { /* log */ };
const auditAction = (action) => { /* audit */ };

// Use what you need, ignore what you don't
const result = processPayment(payment);
logAction(result);
auditAction(result);
```

Each function is self-contained. No inheritance to trace, no interfaces to satisfy.

## Encapsulation: The Closed Object Problem

### The OOP Way

```java
public class User {
    private String name;
    private String email;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    // ... getters and setters for everything
}

// Need to add a field later?
// - Modify the class
// - Add getter/setter
// - Recompile everything that uses it
// - Hope you don't break serialization
```

Objects are closed boxes. Changing them is a surgical operation.

### The Functional Way

```javascript
const user = { name: "Alice", email: "alice@test.com" };

// Need to add a field?
user.avatar = "pic.jpg";  // Done

// Need to transform?
const userWithRole = { ...user, role: "admin" };

// Need to remove?
const { email, ...userWithoutEmail } = user;
```

Data is open. Transform it as needed. No ceremony.

## Design Patterns: Workarounds for OOP's Failures

The Gang of Four wrote a book of 23 design patterns. These aren't features - they're workarounds for OOP's limitations.

### Factory Pattern
**Problem**: Constructors are inflexible
**Workaround**: Create objects through factory methods

```java
// Instead of: new Button()
ButtonFactory.createPrimaryButton();
ButtonFactory.createSecondaryButton();
```

**Functional equivalent**: Just call a function that returns data.

### Dependency Injection
**Problem**: Hard-coded dependencies make testing impossible
**Workaround**: Inject dependencies through constructors

```java
public class OrderService {
    private final PaymentGateway gateway;

    public OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }
}
```

**Functional equivalent**: Pass functions as arguments. Always been possible.

### Strategy Pattern
**Problem**: Need different algorithms at runtime
**Workaround**: Create interface with multiple implementations

```java
interface SortStrategy { void sort(int[] arr); }
class QuickSort implements SortStrategy { ... }
class MergeSort implements SortStrategy { ... }
```

**Functional equivalent**: Pass a function.
```javascript
const sorted = sort(array, (a, b) => a - b);
```

### Observer Pattern
**Problem**: Objects need to react to changes
**Workaround**: Maintain subscriber lists, notify on change

**Functional equivalent**: Event emitters, reactive streams, or just callbacks.

### The Pattern

Every design pattern exists because OOP made something simple into something hard.

## Side Effects: The Hidden State Problem

### OOP Encourages Mutation

```java
public class ShoppingCart {
    private List<Item> items = new ArrayList<>();

    public void addItem(Item item) {
        items.add(item);  // Mutates internal state
    }

    public double getTotal() {
        // Depends on mutable state
        // Result changes based on when you call it
    }
}
```

- What's in the cart? Depends on call history.
- Is it thread-safe? Probably not.
- Can you test it? Need to set up state first.

### Functional Programming: Explicit Transformations

```javascript
const addItem = (cart, item) => [...cart, item];
const getTotal = (cart) => cart.reduce((sum, item) => sum + item.price, 0);

// Cart never changes - you create new carts
const cart1 = [];
const cart2 = addItem(cart1, { name: "Book", price: 20 });
const cart3 = addItem(cart2, { name: "Pen", price: 5 });

getTotal(cart1); // 0 - always
getTotal(cart2); // 20 - always
getTotal(cart3); // 25 - always
```

- No hidden state
- Thread-safe by default
- Easy to test - just call functions with data

## Testing: Mocks vs Pure Functions

### OOP Testing Nightmare

```java
@Test
public void testOrderProcessing() {
    // Mock the database
    OrderRepository mockRepo = mock(OrderRepository.class);
    when(mockRepo.findById(1)).thenReturn(new Order(...));

    // Mock the payment gateway
    PaymentGateway mockGateway = mock(PaymentGateway.class);
    when(mockGateway.charge(any())).thenReturn(true);

    // Mock the email service
    EmailService mockEmail = mock(EmailService.class);

    // Mock the logger
    Logger mockLogger = mock(Logger.class);

    // Create service with all mocks
    OrderService service = new OrderService(
        mockRepo, mockGateway, mockEmail, mockLogger
    );

    // Finally, test something
    service.processOrder(1);

    // Verify mocks were called correctly
    verify(mockGateway).charge(any());
    verify(mockEmail).send(any());
}
```

Half the test is setting up mocks. You're testing mock wiring, not business logic.

### Functional Testing

```javascript
test('calculate order total with discount', () => {
    const order = [
        { name: "Book", price: 20 },
        { name: "Pen", price: 5 }
    ];
    const discount = 0.1;

    const result = calculateTotal(order, discount);

    expect(result).toBe(22.50);
});
```

Pure function, pure test. Input → output. Done.

## React: Composition Wins

React is the clearest victory of functional composition over OOP inheritance.

### The Old Way (Class Components)

```javascript
class Button extends React.Component {
    render() {
        return <button>{this.props.children}</button>;
    }
}

class PrimaryButton extends Button {
    // How do you extend this?
    // Override render? Call super?
}

class IconButton extends Button {
    // What if you need PrimaryIconButton?
    // Multiple inheritance isn't allowed
}
```

### The Modern Way (Functional Components + Props)

```javascript
function Button({ variant, icon, children, ...props }) {
    return (
        <button
            className={`btn btn-${variant}`}
            {...props}
        >
            {icon && <Icon name={icon} />}
            {children}
        </button>
    );
}

// Use it any way you want
<Button variant="primary">Click</Button>
<Button variant="secondary" icon="star">Save</Button>
<Button variant="danger" icon="trash" onClick={handleDelete}>Delete</Button>
```

No inheritance hierarchy. Just props. Need a new variant? Add a prop value. Need an icon? Pass the prop. Infinitely composable.

## The DRY Violation

### OOP's DRY Claim

"Inheritance prevents code duplication!"

### Reality

```java
// Base class
public abstract class AbstractRepository<T> {
    protected abstract String getTableName();
    protected abstract T mapRow(ResultSet rs);

    public T findById(int id) { ... }
    public List<T> findAll() { ... }
    public void save(T entity) { ... }
    public void delete(int id) { ... }
}

// For each entity
public class UserRepository extends AbstractRepository<User> {
    @Override protected String getTableName() { return "users"; }
    @Override protected User mapRow(ResultSet rs) { ... }
}

public class OrderRepository extends AbstractRepository<Order> {
    @Override protected String getTableName() { return "orders"; }
    @Override protected Order mapRow(ResultSet rs) { ... }
}
```

You've "avoided duplication" but created:
- Abstract class boilerplate
- Override boilerplate for every entity
- Tight coupling to base class implementation

### Functional DRY

```javascript
const createRepository = (tableName, mapRow) => ({
    findById: (id) => query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]).then(mapRow),
    findAll: () => query(`SELECT * FROM ${tableName}`).then(rows => rows.map(mapRow)),
    save: (entity) => query(`INSERT INTO ${tableName} ...`),
    delete: (id) => query(`DELETE FROM ${tableName} WHERE id = ?`, [id])
});

const userRepo = createRepository('users', mapUser);
const orderRepo = createRepository('orders', mapOrder);
```

Same DRY benefit, no inheritance, no override ceremony.

### The Problem Isn't Objects

Objects as data containers are fine:
```javascript
const user = {
    name: "Alice",
    email: "alice@test.com",
    getDisplayName() { return this.name.toUpperCase(); }
};
```

The problem is:
- Deep inheritance hierarchies
- Complex polymorphic relationships
- Tight coupling through interfaces
- Hidden state and side effects
- The belief that everything must be a class

### OOP Cons
- Inheritance creates fragile hierarchies
- Polymorphism causes confusion
- Encapsulation makes objects rigid
- Design patterns are workarounds
- Testing requires extensive mocking
- Side effects and mutable state cause bugs
- Mental overhead of tracking inheritance chains
- Violates DRY through boilerplate

### Functional Programming Pros
- Pure functions are easy to test
- Composition is flexible
- No hidden state
- Easy to reason about
- Data is open and transformable
- No inheritance to track
- Naturally thread-safe
- React, Redux, modern tools embrace it

## Conclusion

OOP was designed to model the real world, but it created an artificial world of hierarchies, interfaces, and patterns that don't exist in reality.

Functional programming aligns with how we actually think about computation: data goes in, data comes out. Transform what you need. Compose simple pieces into complex behavior.

The industry is moving functional. React abandoned classes. Rust has no inheritance. Go has no classes. Modern JavaScript is increasingly functional. Even Java added lambdas and streams.

You don't need to go full Haskell. But if you're starting a new project in 2025 and your first instinct is to create a class hierarchy, stop and ask: could this just be functions and data?

Usually, the answer is yes.
