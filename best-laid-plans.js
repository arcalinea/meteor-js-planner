

// if (Meteor.isClient) {
//   This seeds the database, runs on client only
//   Template.body.helpers({
//     tasks: [
//       { text: "This is task 1" },
//       { text: "This is task 2" },
//       { text: "This is task 3" }
//     ]
//   });
// }


Tasks = new Mongo.Collection("tasks");
Plans = new Mongo.Collection("plans");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    plans: function() {
      return Plans.find({}, {sort: {createdAt: -1}});
    },
    planSelected: function () {
        // var found_tasks = Tasks.find({}, {plan_id: plan_id});
       return Session.get("planSelected");
     }
  });

  Template.plans_container.helpers({
    tasks: function () {
      var id = Session.get("planSelected");
      console.log(id);
      if (id) {
        if (Session.get("hideCompleted")){
          // If hide completed is checked, filter tasks
          return Tasks.find( { $and: [ {plan_id: id}, {checked: {$ne: true}} ] }, {sort: {createdAt: -1}});
        } else {
          return Tasks.find({plan_id: id}, {sort: {createdAt: -1}});
        }
      }
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });


    Template.body.events({
    "submit .new-plan": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      Plans.insert({
        text: text,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username,
        // What should the id be? auto-generated? 
      });
      // plan_id = PlanId();

      event.target.text.value = "";
    },


    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      // Get value from form element
      var text = event.target.text.value;
      // Insert a task into the collection
      // plan_id = PlanId();

      var plan_id = $(".select-plan").val();
      var plan_name = $(".select-plan").find(":selected").text();

      Tasks.insert({
        text: text,
        createdAt: new Date(), // current time
        owner: Meteor.userId(), // _id of logged in user
        username: Meteor.user().username,  // username of logged in user
        // Store task with reference to plan
        plan_id: plan_id,
        plan_name: plan_name
      });
      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.plans_container.events({
    "click .plan li": function(){
      var plan_id = event.target.id
      // console.log(plan_id)
      // What is event targeting? "checked" is assigned class name

      // Blaze.insert(Blaze.renderWithData(Template.task, {plan_id: plan_id}), document.querySelector(.tasks_container))

      Session.set("planSelected", plan_id);


      // console.log(found_tasks);
    },
    "click .delete": function () {
      Plans.remove(this._id);
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Tasks.update(this._id, {
         $set: {checked: ! this.checked}
      });
    },
    "click .delete": function () {
      Tasks.remove(this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

