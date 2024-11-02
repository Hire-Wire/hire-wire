/*
 * class: CurrentUserSubject.js
 * implements: subject.js, observer.js
 *
 * The CurrentUserSubject class is a subject in the observer pattern, responsible for tracking the currently authenticated user (`currentUser`)
 * and notifying registered observers of any updates to this user. Observers register with CurrentUserSubject to receive updates
 * on the authentication status, such as a change in the current user or when the user logs out.
 *
 * Key Responsibilities:
 * - Maintains a reference to `currentUser`, which represents the currently authenticated user.
 * - Provides methods to register, remove, and notify observers of changes to the `currentUser`.
 * - Updates `currentUser` through `setCurrentUser` and notifies all registered observers.
 * - Supports setting `currentUser` to `null` to signal user logout, notifying all observers of the change.
 *
 * Example Usage:
 * - A `JobAppController` class can register with CurrentUserSubject to observe changes in `currentUser`
 *   and take appropriate actions, such as refreshing user-specific content in response to updates.
 */

import SubjectInterface from '../interfaces/subject.js';

class CurrentUserSubject extends SubjectInterface {


    constructor(User) {
        super();
        this.currentUser = User;
        this.observerList = [];
        console.log(`CurrentUserSubject initialized with user: ${User}`);
    }


    /**
     * @override
     * Registers a new observer.
     * @param {Observer} observer - The observer to register.
     */
    registerObserver(observer) {
        this.observerList.push(observer);
        console.log(`Observer registered. Total observers: ${this.observerList.length}`);
    }


    /**
     * @override
     * Removes the specified observer.
     * @param {Observer} observer - The observer to remove.
     */
    removeObserver(observer) {
        this.observerList = this.observerList.filter(obs => obs !== observer);
        console.log(`Observer removed. Total observers: ${this.observerList.length}`);
    }


    /**
     * @override
     * Notifies all registered observers with the current user data.
     */
    notifyObservers() {
        console.log(`Notifying ${this.observerList.length} observers of current user: ${this.currentUser}`);
        this.observerList.forEach(observer => observer.update(this.currentUser));
    }


    /**
     * Sets a new current user and notifies all observers of the change.
     * @param {Object} user - The new current user.
     */
    setCurrentUser(user) {
        this.currentUser = user;
        console.log(`Current user set to: ${user}`);
        this.notifyObservers(); // Notify observers of the updated current user
    }


    /**
     * Removes the current user, sets currentUser to null, and notifies observers.
     */
    removeCurrentUser() {
        this.currentUser = null;
        console.log("Current user removed. Notifying observers of null user.");
        this.notifyObservers(); // Notify observers that there's no active user
    }
}

export default CurrentUserSubject;
