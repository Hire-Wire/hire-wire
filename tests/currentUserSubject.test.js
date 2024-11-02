// Import the classes
import CurrentUserSubject from '../src/subjects/currentUserSubject.js';
import Observer from '../src/interfaces/observer.js'; // Assuming Observer is an interface or class with `update` method

// Create a mock observer for testing
class MockObserver extends Observer {
    constructor() {
        super();
        this.update = jest.fn(); // Mock the `update` method
    }
}

describe('CurrentUserSubject', () => {
    let currentUserSubject;
    let observer1;
    let observer2;

    beforeEach(() => {
        currentUserSubject = new CurrentUserSubject("InitialUser");
        observer1 = new MockObserver();
        observer2 = new MockObserver();
    });

    // Test constructor and initialization
    test('should initialize with the provided user and an empty observer list', () => {
        expect(currentUserSubject.currentUser).toBe("InitialUser");
        expect(currentUserSubject.observerList).toEqual([]);
    });

    // Test registerObserver
    describe('registerObserver', () => {
        test('should add an observer to the observerList', () => {
            currentUserSubject.registerObserver(observer1);
            expect(currentUserSubject.observerList).toContain(observer1);
            expect(currentUserSubject.observerList.length).toBe(1);
        });

        test('should allow multiple observers to be registered', () => {
            currentUserSubject.registerObserver(observer1);
            currentUserSubject.registerObserver(observer2);
            expect(currentUserSubject.observerList.length).toBe(2);
            expect(currentUserSubject.observerList).toEqual([observer1, observer2]);
        });
    });

    // Test removeObserver
    describe('removeObserver', () => {
        test('should remove an observer from the observerList', () => {
            currentUserSubject.registerObserver(observer1);
            currentUserSubject.removeObserver(observer1);
            expect(currentUserSubject.observerList).not.toContain(observer1);
            expect(currentUserSubject.observerList.length).toBe(0);
        });

        test('should not affect observerList if observer is not in the list', () => {
            currentUserSubject.registerObserver(observer1);
            currentUserSubject.removeObserver(observer2); // observer2 was never added
            expect(currentUserSubject.observerList.length).toBe(1);
            expect(currentUserSubject.observerList).toContain(observer1);
        });
    });

    // Test notifyObservers
    describe('notifyObservers', () => {
        test('should call update on each observer with the current user', () => {
            currentUserSubject.registerObserver(observer1);
            currentUserSubject.registerObserver(observer2);
            currentUserSubject.notifyObservers();
            expect(observer1.update).toHaveBeenCalledWith("InitialUser");
            expect(observer2.update).toHaveBeenCalledWith("InitialUser");
        });

        test('should not throw an error if no observers are registered', () => {
            expect(() => currentUserSubject.notifyObservers()).not.toThrow();
        });
    });

    // Test setCurrentUser
    describe('setCurrentUser', () => {
        test('should set a new current user and notify observers', () => {
            currentUserSubject.registerObserver(observer1);
            currentUserSubject.setCurrentUser("NewUser");
            expect(currentUserSubject.currentUser).toBe("NewUser");
            expect(observer1.update).toHaveBeenCalledWith("NewUser");
        });

        test('should notify all registered observers when the user changes', () => {
            currentUserSubject.registerObserver(observer1);
            currentUserSubject.registerObserver(observer2);
            currentUserSubject.setCurrentUser("AnotherUser");
            expect(observer1.update).toHaveBeenCalledWith("AnotherUser");
            expect(observer2.update).toHaveBeenCalledWith("AnotherUser");
        });
    });

    // Test removeCurrentUser
    describe('removeCurrentUser', () => {
        test('should set currentUser to null and notify observers', () => {
            currentUserSubject.registerObserver(observer1);
            currentUserSubject.removeCurrentUser();
            expect(currentUserSubject.currentUser).toBeNull();
            expect(observer1.update).toHaveBeenCalledWith(null);
        });

        test('should notify all registered observers when the currentUser is removed', () => {
            currentUserSubject.registerObserver(observer1);
            currentUserSubject.registerObserver(observer2);
            currentUserSubject.removeCurrentUser();
            expect(observer1.update).toHaveBeenCalledWith(null);
            expect(observer2.update).toHaveBeenCalledWith(null);
        });
    });
});
