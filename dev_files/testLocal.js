
import _1GetAudio from './_1GetAudio.js';
import _2AudioToText from './_2AudioToText.js';
import _3GetTextAnswer from './_3GetTextAnswer.js';
import _4TextToAudio from './_4TextToAudio.js';
import _5PlayAudio from './_5PlayAudio.js';

async function init() {
  // const getAudio      = new _1GetAudio(     { skip: false  });
  // const audioToText   = new _2AudioToText(  { skip: false });
  // const getTextAnswer = new _3GetTextAnswer({ skip: false });
  // const textToAudio   = new _4TextToAudio(  { skip: false });
  const playAudio     = new _5PlayAudio(    { skip: false });

  process.on('SIGINT', () => {
    try {
      getAudio.file.end();
    } catch (error) {
      // console.error(error);
    }
  
    console.log('App stopped.');
    process.exit();
  });

}

init();
