

As of October 17th, I have completed almost all of the frontend, which includes login/signup pages, an event timeline, an event form page, a request center for viewing sent and received requests, a profile page, an account settings page, and a profile settings page. It also includes an administrative user interface, where admin uses can view pending posts and accept or deny them. All of these pages are mostly functional apart from a few exceptions. For example, a user cannot currently change their password, and there is not yet a way to upload a profile photo or a photo to go with an event post. 
	
What I plan to do next is create a new form for when a user selects the “Other” option (as opposed to a preapproved event on the list of events they have to choose from) when creating a post that will allow the user to enter the date and name of the event, and that will not show up when a preapproved event is selected (because it will have a preset name and date). After that, I will create a form that admin users can access to create events for the event list, so that an event can be added to the list without having to have a user submit a request. Following that, I will work on making it possible for users to upload photos and implementing push notifications.  
	
Once the event form/posting process is modified, the ability to upload photos is added, and push notifications are implemented, the requirements of the MVP will be met. 


__________________________________________________________

Oct. 24th:  

Since last week, I have done the following things: added additional inputs to the post form page if the “Other” event option is selected to allow a user to input the name and date of the event; added a way for users to change their email and password through the account settings page; corrected an issue with the administrative user approval process to check if an event of the same date and name is already included in the event list; reworked the signup form for creating a new account; added a section to the notification center that shows a user’s posts that are pending admin approval; added a form for admin users to create new events for the event list; and added (on the user’s profile page) a field to each of the user’s posts that shows the status of the post (pending, denied, approved). 

Then, I will implement push notifications and a way for users to upload photos for their posts or profile. Other than these features, the MVP requirements have been met. 

__________________________________________________________

Nov. 5th:

After reassessing the MVP of the project, it has been decided that it is more important to implement in-app messaging and have the first version of the app be a PWA (Progressive Web App) instead of a native mobile app. With that decision in mind, I have implemented the in-app messaging feature. Now, when a request is accepted by a user, a new chat thread is created between the users, removing the need to communicate outside of the app. The in-app messaging is lacking in that the chat threads cannot be deleted at this time. The user currently has the ability to select messages to delete, but the function that actually does the thread deletion is incomplete. 

For the MVP to be completed, the ability to upload photos still needs to be added. Additionally, the MVP will now require only in-app notifications (as opposed to push notifications) that have yet to be implemented. 










