
import FaFileTextO from 'react-icons/lib/fa/file-text-o';
import FaParagraph from 'react-icons/lib/fa/paragraph';
import FaHashtag from 'react-icons/lib/fa/hashtag';
import FaListUl from 'react-icons/lib/fa/list-ul';
import FaEnvelopeO from 'react-icons/lib/fa/envelope-o';
import FaCalendar from 'react-icons/lib/fa/calendar';
import FaGlobe from 'react-icons/lib/fa/globe';
import FaPhone from 'react-icons/lib/fa/phone';

export default [
  { friendlyType: 'Short Answer', type: 'TextField', icon: FaFileTextO },
  { friendlyType: 'Long Answer', type: 'TextArea', icon: FaParagraph },
  { friendlyType: 'Numbers', type: 'NumberField', icon: FaHashtag, props: { validateAs: 'number', validationMessage: 'Only numbers are allowed in this field.'} },
  {
    friendlyType: 'Multiple choice',
    type: 'MultipleChoice',
    icon: FaListUl,
    props: { multipleChoice: false, otherAllowed: false, options: [] }
  },
  { friendlyType: 'Email', identity: true, type: 'EmailField', icon: FaEnvelopeO, props: { validateAs: 'email', validationMessage: 'Please type a valid e-mail.' } },
  { friendlyType: 'Date', type: 'DateField', icon: FaCalendar, props: { validationMessage: 'Please type a valid date' } },
  { friendlyType: 'Phone number', identity: true, type: 'PhoneNumber', icon: FaPhone }
];
