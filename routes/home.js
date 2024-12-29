const express = require('express');
const router = express.Router();
const showDoc = (req, res) => {
  res.status(200).json({
    mseg: 'click url to get Docs',
    url: `https://documenter.getpostman.com/view/31038051/2sAYJ6AybE`,
  });
};

router.route('/').get(showDoc);
module.exports = router;
