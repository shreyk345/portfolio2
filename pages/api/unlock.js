export const runtime = 'edge'

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { password } = await req.json()

  if (!password) {
    return new Response(JSON.stringify({ error: 'Password required' }), { status: 400 })
  }

  if (password === process.env.CASE_STUDY_PASSWORD) {
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  }

  return new Response(JSON.stringify({ error: 'Incorrect password' }), { status: 401 })
}