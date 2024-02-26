import { Input } from 'antd';
import buildInput from './buildInput';

const InputEx = buildInput(Input);

InputEx.TextAreaEx = buildInput(Input.TextArea);

export default InputEx;