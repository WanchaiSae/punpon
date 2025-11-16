import React, { useEffect, useState } from "react";

const StockSearch = () => {
  // 1. State สำหรับเก็บคำค้นหา (Ticker Symbol)
  const [searchTerm, setSearchTerm] = useState("MSFT"); // Default Value เลือก MSFT เพราะใช้ Windows อยู่
  // 2. State สำหรับเก็บข้อมูลหุ้นที่ได้จาก API
  const [stockData, setStockData] = useState(null);
  // 3. State สำหรับจัดการสถานะการโหลด/ข้อผิดพลาด
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 4. ฟังก์ชันจัดการการพิมพ์ในช่อง Input
  const handleInputChange = (event) => {
    // อัปเดต State ทันทีที่ผู้ใช้พิมพ์
    setSearchTerm(event.target.value.toUpperCase());
  };

  // 5. Hook สำหรับเรียก API เมื่อ searchTerm เปลี่ยนแปลง
  useEffect(() => {
    // หากช่องค้นหาว่างเปล่า ให้ล้างข้อมูลและหยุด
    if (!searchTerm) {
      setStockData(null);
      setError(null);
      return;
    }

    // -----------------------------------------------------------
    // 💥 สำคัญ: เทคนิค Debouncing เพื่อรอให้ผู้ใช้หยุดพิมพ์ 300ms
    const timer = setTimeout(() => {
      fetchStockData(searchTerm);
    }, 300);
    // -----------------------------------------------------------

    // Cleanup function: จะทำงานเมื่อ Component ถูก Unmount
    // หรือเมื่อ useEffect ถูกเรียกใหม่ (เช่น searchTerm เปลี่ยน)
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 6. ฟังก์ชันสำหรับเรียก API จริง
  const fetchStockData = async (symbol) => {
    setLoading(true);
    setError(null);

    // ⚠️ URL เดียวกับที่คุณตั้งค่าใน Django (เช่น http://localhost:8000/stock/JEPQ/)
    const apiUrl = `http://127.0.0.1:8000/stock/${symbol}/`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          // ส่ง Header เพื่อบังคับให้ Django REST Framework ส่ง JSON กลับมา
          Accept: "application/json",
        },
      });

      if (response.status === 404) {
        throw new Error(`ไม่พบ Ticker Symbol: ${symbol}`);
      }

      if (!response.ok) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลจาก Server`);
      }

      const data = await response.json();
      setStockData(data);
    } catch (error) {
      setError(error.message);
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-3xl text-center m-8">
        ค้นหาหุ้นสหรัฐอเมริกา
        <div className="p-4">
          <hr />
        </div>
      </div>
      <div>
        <form className="text-center">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="ป้อน Ticker Symbol (เช่น JEPQ, AAPL)"
            className="uppercase p-4 rounded-md border border-green-800"
          />
        </form>
        {/* แสดงผลลัพธ์ */}

        <div className="text-center mt-8">
          {loading && <p>🚀 กำลังค้นหาข้อมูล...</p>}
          {error && <p className="text-red-500">⚠️ Error: {error}</p>}

          {stockData && !loading && (
            <div>
              <h3 className="font-semibold text-2xl">
                ชื่อ : {stockData.longName} สัญลักษณ์ : {stockData.symbol}
                <p>ราคาหุ้นปัจจุบัน : ${stockData.regularMarketPrice}</p>
                <p>
                  {stockData.dividendYield && stockData.dividendYield > 0
                    ? `หุ้นปันผล : ${stockData.dividendYield.toFixed(2)}% ต่อปี`
                    : "🚫 หุ้นตัวนี้ไม่ได้จ่ายเงินปันผล (หรือไม่พบข้อมูล)"}
                </p>
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSearch;
