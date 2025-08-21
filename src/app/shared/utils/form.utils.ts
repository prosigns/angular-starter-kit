import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors
} from '@angular/forms';

/**
 * Mark all form controls as touched to trigger validation messages
 */
export function markFormGroupTouched(formGroup: FormGroup | FormArray): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.controls[key];

    if (control instanceof FormControl) {
      control.markAsTouched();
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      markFormGroupTouched(control);
    }
  });
}

/**
 * Reset form and clear validators
 */
export function resetForm(formGroup: FormGroup): void {
  formGroup.reset();
  Object.keys(formGroup.controls).forEach(key => {
    formGroup.controls[key].setErrors(null);
  });
}

/**
 * Validate all form fields and return if the form is valid
 */
export function validateForm(formGroup: FormGroup): boolean {
  markFormGroupTouched(formGroup);
  return formGroup.valid;
}

/**
 * Get a nested form control by path (e.g. 'person.address.street')
 */
export function getControlByPath(form: FormGroup, path: string): AbstractControl | null {
  const segments = path.split('.');
  let currentControl: AbstractControl = form;

  for (const segment of segments) {
    if (currentControl instanceof FormGroup || currentControl instanceof FormArray) {
      currentControl = currentControl.get(segment) as AbstractControl;
      if (!currentControl) return null;
    } else {
      return null;
    }
  }

  return currentControl;
}

/**
 * Get all errors from a form control, including nested errors
 */
export function getAllErrors(
  control: AbstractControl | null,
  result: { [key: string]: ValidationErrors } = {},
  path: string = ''
): { [key: string]: ValidationErrors } {
  if (!control) {
    return result;
  }

  if (control.errors) {
    result[path] = control.errors;
  }

  if (control instanceof FormGroup) {
    const controls = control.controls;
    Object.keys(controls).forEach(key => {
      const childPath = path ? `${path}.${key}` : key;
      getAllErrors(controls[key], result, childPath);
    });
  } else if (control instanceof FormArray) {
    control.controls.forEach((ctrl, index) => {
      const childPath = `${path}[${index}]`;
      getAllErrors(ctrl, result, childPath);
    });
  }

  return result;
}

/**
 * Creates custom validator for password matching
 */
export function passwordMatchValidator(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup): ValidationErrors | null => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}
