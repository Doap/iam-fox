function attachViewsToElements(callback) {
  var iamcli = newIAMClient();

  function bind(clazz, name) {
    var obj = new clazz(iamcli);
    var tab = $(name + '-tab');
    tab.view = obj;
    var tree = $(name + '-tree');
    tree.view = obj;
    tree._view = obj;
  }

  if (iamcli) {
    bind(GroupTreeView, 'group');
    bind(UserTreeView, 'user');
    bind(ServerCertTreeView, 'server-cert');

    if (callback) {
      callback();
    }
  }
}

function windowOnLoad() {
  attachViewsToElements(function() {
    selectedView().refresh();
  });
}

function tabOnSelect(event) {
  var view = selectedView();
  if (view) { view.refresh(); }
}

function selectedView() {
  var tab = $('main-tabs').selectedItem;
  return tab ? tab.view : null;
}

function treeViews() {
  var views = [];
  var tabs = $('main-tabs').getElementsByTagName('tab');

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].view) {
      views.push(tabs[i].view);
    }
  }

  return views;
}

function openAccountDialog() {
  openDialog('chrome://iamfox/content/account-dialog.xul', 'account-dialog', 'chrome,modal,centerscreen',
             {selectedView:selectedView, attachViewsToElements:attachViewsToElements});
}

function newIAMClient() {
  if (!Prefs.currentUser) {
    //openAccountDialog();
    return null;
  } else {
    var iamcli = new IAMClient(Prefs.accessKeyId, Prefs.secretAccessKey);

    iamcli.query_or_die = function(action, params) {
      var xhr = iamcli.query(action, params);

      if (!xhr.success()) {
        throw xhr;
      }

      return xhr;
    };

    return iamcli;
  }
}

function inProgress(callback) {
  var loader = $('main-loader');
  loader.hidden = false;

  var retval = null;
  var exception = null;

  try {
    retval = callback();
  } catch (e) {
    exception = e;
  }

  loader.hidden = true;

  if (exception) {
    throw exception;
  }

  return retval;
}

function openModalWindow(xul, name, width, height, args) {
  var uri = 'chrome://iamfox/content/' + xul;
  var left = window.screenX + (window.outerWidth - width) / 2;
  var top = window.screenY + (window.outerHeight - height) / 2;
  var features = 'chrome,modal,centerscreen,dialog=no,resizable,width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;

  var w = window.openDialog(uri, name, features, args);

  return w;
}

function openGroupAddDialog() {
  if (selectedView()) {
    openDialog('chrome://iamfox/content/group-add-dialog.xul', 'group-add-dialog', 'chrome,modal,centerscreen',
               {selectedView:selectedView, inProgress:inProgress});
  }
}

function openUserAddDialog() {
  if (selectedView()) {
    openDialog('chrome://iamfox/content/user-add-dialog.xul', 'user-add-dialog', 'chrome,modal,centerscreen',
               {selectedView:selectedView, inProgress:inProgress});
  }
}

function openServerCertAddWindow() {
  openModalWindow('server-cert-add-window.xul', 'server-cert-add-window', 640, 480,
                  {selectedView:selectedView, inProgress:inProgress});
}

function openAboutDialog() {
  openDialog('chrome://iamfox/content/about-dialog.xul', 'about-dialog', 'chrome,modal,centerscreen');
}
