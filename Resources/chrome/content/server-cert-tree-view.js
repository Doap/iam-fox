function ServerCertTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.rowCount = 0;
  this.selection = null;
}

ServerCertTreeView.prototype = {
  getCellText: function(row, column) {
    return this.rows[row][column.id];
  },

  setTree: function(tree) {
    this.tree = tree;
  },

  updateRowCount: function() {
    if (this.rowCount == this.rows.length) {
      return;
    }

    this.tree.rowCountChanged(0, -this.rowCount);
    this.rowCount = this.rows.length;
    this.tree.rowCountChanged(0, this.rowCount);
  },

  refresh: function() {
    this.rows.length = 0;

    protect(function() {
      var xhr = inProgress(function() {
        return this.iamcli.query_or_die('ListServerCertificates');
      }.bind(this));

      for each (var member in xhr.xml()..ServerCertificateMetadataList.member) {
        this.rows.push(member);
      }

      this.updateRowCount();
      this.tree.invalidate();
    }.bind(this));
  },

  selectedRow: function() {
    var idx = this.selection.currentIndex;
    return (idx != -1) ? this.rows[idx] : null;
  },

  deleteCurrentRow: function() {
    var idx = this.selection.currentIndex;

    if (idx != -1) {
      this.rows.splice(idx, 1);
      this.updateRowCount();
    }
  },

  deleteServerCert: function() {
    var cert = this.selectedRow();
    var certName = cert.ServerCertificateName;

    if (!confirm("Are you sure you want to delete '" + certName + " ' ?")) {
      return;
    }

    protect(function() {
      inProgress(function() {
        this.iamcli.query_or_die('DeleteServerCertificate', [['ServerCertificateName', certName]]);

        this.deleteCurrentRow();
        this.tree.invalidate();
      }.bind(this));
    }.bind(this));
  },

  openServerCertEditDialog: function() {
    /*
    var group = this.selectedRow();
    openDialog('chrome://iamfox/content/group-edit-dialog.xul', 'group-edit-dialog', 'chrome,modal',
               {view:this, inProgress:inProgress, group:group});
     */
  },

  selectById: function(certId) {
    var rows = this.rows;

    for (var i = 0; i < rows.length; i++) {
      var user = rows[i];

      if (user.CertificateId == certId) {
        this.selection.select(i);
      }
    }

    this.rows
  }
};
