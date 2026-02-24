import { useLoginStore } from "@/stores/auth/login";
import { LoginForms } from "./LoginForms";
import { TwoFactorForm } from "./TwoFactorForm";
import { VerificationForm } from "./VerificationForm";

const FormContentBase = () => {
  const { isVerificationStep, is2FAVerificationStep } = useLoginStore();

  if (isVerificationStep) {
    return <VerificationForm />;
  }
  if (is2FAVerificationStep) {
    return <TwoFactorForm />;
  }
  return <LoginForms />;
};

export const FormContent = FormContentBase;
