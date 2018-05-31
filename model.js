function Account(name, template) {
  this.name = name;
  this.template = template;
}

Account.prototype.loadTransactions = function(data) {

  var rows = data.split('\n');

  var transactions = [];

  for (var i = 0; i < rows.length; i++) {

    var values = rows[i].split(this.template.separator);

    var date = this.template.columns.date;
    var description = this.template.columns.description;
    var value = this.template.columns.value;

    transactions.push(
      new Transaction(
        this,
        values[date],
        values[description],
        Number(values[value])
      )
    );
  }

  Transaction.saveAll(transactions, false);

}

Account.findAll = function() {
  var data = JSON.parse(localStorage.getItem("accounts"));
  var accounts = [];

  for (var i = 0; i < data.length; i++) {
    accounts.push(new Account(data[i].name, data[i].template));
  };

  return accounts;
}

Account.find = function(name) {
  var all = Account.findAll();
  for (var i = 0; i < all.length; i++) {
    if (all[i].name == name) {
      return all[i];
    }
  }
  return null;
}

/*
 * Transactions
 *
 */
function Transaction(account, date, description, value, tags, edited = false) {

  if (!account) {
    throw "Account is mandatory for Transaction"
  }
  if (!date) {
    throw "Date is mandatory for Transaction"
  }
  if (!description) {
    throw "Description is mandatory for Transaction"
  }
  if (!value) {
    throw "Value is mandatory for Transaction"
  }
  if (isNaN(value)) {
    throw "Value must be a number"
  }

  this.account = account;

  this.date = date;

  var dateObject = new Date(date);

  this.year = dateObject.getFullYear();
  this.month = dateObject.getMonth() + 1;
  this.day = dateObject.getDate();

  this.description = description;
  this.value = value;
  this.tags = tags;
  this.edited = edited;

}

Transaction.prototype.setCustomTags = function(tags) {
  this.tags = tags;
  if (tags.length > 0) {
    this.edited = true;
  } else {
    this.edited = false;
  }
}


Transaction.findAll = function(account, year, month) {

  var objects = [];

  var allTransactions = JSON.parse(
    localStorage.getItem(account.name + ":transactions" + ":" + year + ":" + month));

  if (allTransactions) {
    for (var i = 0; i < allTransactions.length; i++) {
      var transaction = new Transaction(
        account,
        allTransactions[i].date,
        allTransactions[i].description,
        allTransactions[i].value,
        allTransactions[i].tags,
        allTransactions[i].edited
      );
      objects.push(transaction);
    }
  }

  return objects;
}


Transaction.saveAll = function(transactions, override = false) {

  if (transactions && transactions.length > 0) {
    var allTransactions = {}
    for (var i = 0; i < transactions.length; i++) {
      var storageName = transactions[i].account.name + ":transactions" + ":" + transactions[i].year + ":" + transactions[i].month;
      if (!allTransactions[storageName]) {
        allTransactions[storageName] = {
          items: [],
          account: transactions[i].account,
          year: transactions[i].year,
          month: transactions[i].month
        }
      }
      allTransactions[storageName].items.push(transactions[i]);
    }

    for (var storageName in allTransactions) {
      if (override) {
        localStorage.setItem(storageName, JSON.stringify(allTransactions[storageName].items, null, 2));
      } else {
        saved = Transaction.findAll(allTransactions[storageName].account, allTransactions[storageName].year, allTransactions[storageName].month)
        for (var i = 0; i < allTransactions[storageName].items.length; i++) {
          saved.push(allTransactions[storageName].items[i])
        }
        localStorage.setItem(storageName, JSON.stringify(saved, null, 2));
      }
    }

  }

}

/*
 * Tags
 *
 */
function Tag(name, condition) {
  this.name = name;
  this.condition = condition;
}

Tag.findAll = function() {
  var data = JSON.parse(localStorage.getItem("tags"));
  var tags = [];
  for (var i = 0; i < data.length; i++) {
    tags.push(new Tag(data[i].name, data[i].condition));
  };
  return tags;
}

Tag.apply = function(transaction) {
  if (!transaction.edited) {
    transaction.tags = [];
    var tags = Tag.findAll()
    for (var i = 0; i < tags.length; i++) {
      if (eval(tags[i].condition)) {
        transaction.tags.push(tags[i].name);
      }
    }
  }
}

Tag.save = function(objects) {
  localStorage.setItem("tags", JSON.stringify(objects, null, 2));
}
