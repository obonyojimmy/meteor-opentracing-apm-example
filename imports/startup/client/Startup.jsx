import React from 'react';
import { DDP } from 'meteor/ddp-client';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import App from '../../ui/layouts/App.jsx';

DDP.onReconnect((conn) => {
  console.log(conn);
});

/** Startup the application by rendering the App layout component. */
Meteor.startup((conn) => {
  console.log(conn);
  render(<App />, document.getElementById('root'));  // eslint-disable-line
});
