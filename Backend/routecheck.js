const app = require('./index');
setTimeout(() => {
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      console.log('ROUTE', Object.keys(layer.route.methods).join(',').toUpperCase(), layer.route.path);
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      console.log('MOUNT', layer.regexp && layer.regexp.toString());
      layer.handle.stack.forEach((routerLayer) => {
        if (routerLayer.route) {
          console.log('  ', Object.keys(routerLayer.route.methods).join(',').toUpperCase(), routerLayer.route.path);
        }
      });
    } else {
      console.log('LAYER', layer.name, layer.regexp && layer.regexp.toString());
    }
  });
  process.exit(0);
}, 1000);
