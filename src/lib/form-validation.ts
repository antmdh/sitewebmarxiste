const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function text(form: FormData, key: string, maxLength: number) {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function validateEmail(value: string) {
  return value.length <= 254 && emailPattern.test(value);
}

export function json(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
