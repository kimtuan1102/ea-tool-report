//Remove telegram field
db.copytoolreports.update({}, { $unset: { telegram: 1 } }, { multi: true });
