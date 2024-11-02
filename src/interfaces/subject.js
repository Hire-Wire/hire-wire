// Subject interface
class SubjectInterface {
    registerObserver(observer) {
        throw new Error("Method 'registerObserver()' must be implemented.");
    }

    removeObserver(observer) {
        throw new Error("Method 'removeObserver()' must be implemented.");
    }

    notifyObservers(data) {
        throw new Error("Method 'notifyObservers()' must be implemented.");
    }
}

export default SubjectInterface;