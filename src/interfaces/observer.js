// Observer interface
class Observer {
    update(data) {
        throw new Error("Method 'update()' must be implemented.");
    }
}

export default Observer;