var apps = require('../models/apps.js');

module.exports = function(app){
  app.get('/dev/apps', listApps);
  app.get('/dev/apps/create', formApp);
  app.post('/dev/apps/create', createApp);
  app.get('/dev/apps/:id', viewApp);
  app.get('/dev/apps/:id/edit', editApp);
  app.post('/dev/apps/:id/edit', updateApp);
  app.post('/dev/keys/generate', generateKey);
}

var listApps = function(req, res){
  if(!req.isAuthenticated()){
    res.redirect('/');
    return;
  }
  
  apps.AppModel.find({owner: req.user.id}, function(err, applications){
    if(err){
      console.log(err);
      res.send(500, err);
      return;
    }
    console.log(applications);
    res.render('dev/apps', {apps: applications});
  });
};

var viewApp = function(req, res){
  if(!req.isAuthenticated()){
    res.redirect('/');
    return;
  }

  apps.AppModel.findOne({'_id': req.params.id, owner: req.user.id}, function(err, app){
    if(err){
      console.log(err);
      res.send(500, err);
      return;
    }
    if(!app){
      res.send(404, 'app no encontrada');
      return; 
    }
    res.render('dev/view-app', {app: app});
  });
};

var editApp = function(req, res){
  if(!req.isAuthenticated()){
    res.redirect('/');
    return;
  }
  
  apps.AppModel.findOne({'_id': req.params.id, owner: req.user.id}, function(err, app){
    if(err){
      console.log(err);
      res.send(500, err);
      return;
    }
    if(!app){
      res.send(404, 'app no encontrada');
      return; 
    }
    res.render('dev/edit-app', {model: app, errors: {}});
  });
};

var updateApp = function(req, res){
  if(!req.isAuthenticated()){
    res.redirect('/');
    return;
  }
  var model = {},
     errors = {};

  //validar campos:
  model.name = req.body.name || '';
  if(model.name.length < 4 || model.name.length > 40){
    errors.name = 'El nombre debe tener entre 5 y 40 caracteres';
  };

  model.url = req.body.url;
  
  model.description = req.body.description || '';
  if(model.description.length < 3 || model.description.length > 500){
    errors.description = 'La description debe tener entre 3 y 500 caracteres';
  };

  //tags pendientes por ahora

  model.owner = req.user;
  if(Object.keys(errors).length > 0){
    res.render('dev/create-app', {model: model, errors: errors});
    return;
  }

  apps.AppModel.update({'_id': req.params.id, owner: req.user.id}, {$set:model}, function(err, app){
    if(err){
      console.log(err);
      res.send(500, err);
      return;
    }
    res.redirect('dev/apps/' + req.params.id);
  });
};

var formApp = function(req, res){
  if(!req.isAuthenticated()){
    res.redirect('/');
    return;
  }
  var model = {name: '', description: '', url: ''};
  console.log(model);
  res.render('dev/create-app', {model: model, errors: {}});
};

var createApp = function(req, res){
  if(!req.isAuthenticated()){
    res.redirect('/');
    return;
  }
  var model = {},
     errors = {};

  //validar campos:
  model.name = req.body.name || '';
  if(model.name.length < 4 || model.name.length > 40){
    errors.name = 'El nombre debe tener entre 5 y 40 caracteres';
  };

  model.url = req.body.url;
  
  model.description = req.body.description || '';
  if(model.description.length < 3 || model.description.length > 500){
    errors.description = 'La description debe tener entre 3 y 500 caracteres';
  };

  //tags pendientes por ahora

  model.owner = req.user;
  if(Object.keys(errors).length > 0){
    res.render('dev/create-app', {model: model, errors: errors});
    return;
  }

  new apps.AppModel(model)
  .save(function(err, app){
    if(err){
      console.log(err);
      res.send(500, err);
      return;
    }
    res.redirect('dev/apps/' + app.id);
  });
};


var generateKey = function(req, res){
  var key = require('generate-key').generateKey(50);
  res.json({key:key});
};