const url = 'https://script.google.com/macros/s/AKfycbz6cR-xROnKZME0Fu3CSxiyhYlt4gJgcxxx-Wu_DR9sT2d8H4mrPTtU4XM5GWXFjzfe/exec';

async function test() {
  console.log("Testing verifyId with ADMIN-001...");
  try {
    const verifyRes = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'verifyId',
        student_id: 'ADMIN-001'
      })
    });
    console.log("verifyId Status:", verifyRes.status);
    const verifyText = await verifyRes.text();
    console.log("verifyId Response:", verifyText);

    console.log("\nTesting login with ADMIN-001 / adminpass...");
    const loginRes = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        student_id: 'ADMIN-001',
        password: 'adminpass'
      })
    });
    console.log("login Status:", loginRes.status);
    const loginText = await loginRes.text();
    console.log("login Response:", loginText);

  } catch (e) {
    console.error("Error:", e);
  }
}

test();
