//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rohan:1939gtaVrocks@cluster0.s64it2i.mongodb.net/todolistDB", {useNewUrlParser: true});
mongoose.set('strictQuery', true);
const itemsSchema = {
  name: String
} ;

const Item = mongoose.model("item",itemsSchema);
const item1 = new Item({
  name: "Welcome to our todolist!"
});
const item2 = new Item({
  name: "Hit the + button to aff a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});


const defaultItems = [item1,item2,item3]; 

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

const workItems = [];

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }else {
    console.log("Successfully saved!");
  }
});
res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
    console.log(foundItems);
  });



});

app.post("/", function(req, res){
  const itemName = req.body.newItem; 
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req ,res){
  const checkedItemid= req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemid, function(err){
      if(err){
        console.log(err);
      }
      else {
        console.log("Successfully Deleted!");
      }
      res.redirect("/");
    });
  }
  else {
    List.findOneAndUpdate({name: listName},{$pull:{items :{_id:checkedItemid}}},function(err ,foundOne){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
    
  });

  
  
});
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
