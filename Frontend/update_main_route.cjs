const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'main.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

if (!content.includes('import MyCalendar from')) {
    content = content.replace(
        "import OfficeCalendar from './Admin/OfficeCalendar.jsx'",
        "import OfficeCalendar from './Admin/OfficeCalendar.jsx'\nimport MyCalendar from './Admin/MyCalendar.jsx'"
    );
}

if (!content.includes("path: 'my-calendar',")) {
    content = content.replace(
        "          {\n            path: 'office-calendar',\n            element: <OfficeCalendar />,\n          },",
        "          {\n            path: 'office-calendar',\n            element: <OfficeCalendar />,\n          },\n          {\n            path: 'my-calendar',\n            element: <MyCalendar />,\n          },"
    );
}

fs.writeFileSync(filePath, content, 'utf-8');
