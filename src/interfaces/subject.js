// Subject interface
class Subject {
    addObserver(observer) {
        throw new Error("Method 'addObserver()' must be implemented.");
    }

    removeObserver(observer) {
        throw new Error("Method 'removeObserver()' must be implemented.");
    }

    notifyObservers(data) {
        throw new Error("Method 'notifyObservers()' must be implemented.");
    }
}