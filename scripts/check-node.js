const version = process.versions.node.split('.').map(Number);
if (version[0] < 18) {
  console.error(`Node ${process.versions.node} detected. Please use Node >= 18.`);
  process.exit(1);
}
