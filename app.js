const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _ = require("lodash")


var newTasks =[];
var workTasks=[];


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))


mongoose.connect("mongodb+srv://sharvarichawade:test1234@cluster0.zrgy6lu.mongodb.net/todolistDB", {useNewUrlParser: true});


const itemsSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemsSchema]
};


const Item = mongoose.model('Item', itemsSchema)
const List = mongoose.model('List', listSchema)


const d1 = new Item({
  name: 'Welcome to your To Do List'
})

const d2 = new Item({
  name: 'Click on + to add new item'
})

const d3 = new Item({
  name: '<-- Hit this to delete'
})

const defaultItems = [d1, d2, d3]


// home page

app.get("/", function(req,res){
  Item.find({},function(err, foundItems){
    // let day = date();
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }else{
          console.log("Inserted successfully!")
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list",{ listTitle:'Today', newTask: foundItems });
    }
  })

});

app.post("/",function(req,res){

  var newTask = req.body.newTask;
  const listName = req.body.list;

  const newItem = new Item({
    name: newTask
  });

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else{

    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


  // if(req.body.list === "Work"){
  //   workTasks.push(newTask);
  //   console.log(newTask);
  //   res.redirect("/work");
  // }
  // else{
  //   newTasks.push(newTask);
  //   console.log("work task is" + newTask);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItem = (req.body.checkbox);
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem, function(err){
      if(err){
        console.log(err)
      }
      else{
        console.log("Deleted successfully")
        res.redirect("/")
      }
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })

  }

})

app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName)
      }else{
        console.log(foundList)
        res.render("list",{listTitle:foundList.name, newTask:foundList.items})
      }
    }
  })

});
// work page
app.get("/work", function(req,res){
  res.render("list",{
    listTitle:"Work List",
    newTask: workTasks
  });
});

app.post("/work",function(req,res){
  var newTask = req.body.newTask;
  workTasks.push(newTask);
  console.log(newTask);
  res.redirect("/work");
})


// about page
app.get("/about",function(req,res){
  res.render("about");
})


app.listen(3000, function(){
  console.log("server is up and running");
});

// if (today.getDay() === 0){
//   day = "Sunday";
// }
// else if (today.getDay() === 1) {
//   day = "Monday";
// }
// else if (today.getDay() === 2) {
//   day = "Tuesday";
// }
// else if (today.getDay() === 3) {
//   day = "Wednesday";
// }
// else if (today.getDay() === 4) {
//   day = "Thursday";
// }
// else if (today.getDay() === 5) {
//   day = "Friday";
// }
// else if (today.getDay() === 9) {
//   day = "Saturday";
// }
// switch(today.getDay())
// {
//   case 0:
//     day = "Sunday";
//     break;
//   case 1:
//     day = "Monday";
//     break;
//   case 2:
//     day = "Tuesday";
//     break;
//   case 3:
//     day = "Wednesday";
//     break;
//   case 4:
//     day = "Thursday";
//     break;
//   case 5:
//     day = "Friday";
//     break;
//   case 6:
//     day = "Saturday";
//     break;
//   default:
//     console.log("Error")
// }
