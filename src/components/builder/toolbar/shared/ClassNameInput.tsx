import Input from "@/components/elements/form/input/Input";

const ClassNameInput = ({ value, onChange, onKeyPress, placeholder }) => (
  <Input
    onChange={onChange}
    onKeyPress={onKeyPress}
    placeholder={placeholder}
    shape={"rounded-xs"}
    size="sm"
    value={value}
  />
);

export default ClassNameInput;
