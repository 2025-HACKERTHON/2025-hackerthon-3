import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Onboarding from './components/Owner_Section/Onboarding'
import Login from './components/Owner_Section/Login'
import Signup from './components/Owner_Section/Signup'
import Store_info from './components/Owner_Section/Store_info'
import Menu1 from './components/Customer_Section/Menu1'
import Menu2 from './components/Customer_Section/Menu2'
import Menu3 from './components/Customer_Section/Menu3'
import Menu4 from './components/Customer_Section/Menu4'
import Menu5 from './components/Customer_Section/Menu5'
import QRScan from './components/Customer_Section/QRScan'
import Menu from './components/Customer_Section/Menu'
import Menu_Best from './components/Customer_Section/Menu_Best'
import Menu_Language from './components/Customer_Section/Menu_Language'
import Menu_Table from './components/Customer_Section/Menu_Table'
import Cus_options from './components/Customer_Section/Cus_options'
import Cus_order from './components/Customer_Section/Cus_order'
import Owner_home_first from './components/Owner_Section/Owner_home_first'
import Menu_English from './components/Owner_Section/Menu_English'
import Menu_Japanese from './components/Owner_Section/Menu_Japanese'
import Menu_Chinese from './components/Owner_Section/Menu_Chinese'
import Owner_QR from './components/Owner_Section/Owner_QR'


const App = () => {
  return (


    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="Menu1" element={<Menu1 />} />
      <Route path="Menu2" element={<Menu2 />} />
      <Route path="Menu3" element={<Menu3 />} />
      <Route path="Menu4" element={<Menu4 />} />
      <Route path="Menu5" element={<Menu5 />} />
      <Route path="qr" element={<QRScan />} />
      <Route path="menu_best" element={<Menu_Best />} />
      <Route path="menu_language" element={<Menu_Language />} />
      <Route path="menu_table" element={<Menu_Table />} />
      <Route path="cus_order" element={<Cus_order />} />
      <Route path="cus_options" element={<Cus_options />} />

    </Routes>

  );
};

    <BrowserRouter>
    <Routes>
      <Route path='/Onboarding' element={<Onboarding/>} />
      <Route path='/Login' element={<Login/>} />
      <Route path='/Signup' element={<Signup/>} />
      <Route path='/Storeinfo' element={<Store_info/>} />
      <Route path='/Menu1' element={<Menu1/>} />
      <Route path='/Menu2' element={<Menu2/>} />
      <Route path='/Menu3' element={<Menu3/>} />
      <Route path='/Menu4' element={<Menu4/>} />
      <Route path='/Menu5' element={<Menu5/>} />
      <Route path="/qr" element={<QRScan />} />
      <Route path='/' element={<Menu />} />
      <Route path='/menu_best' element={<Menu_Best />} />
      <Route path='/menu_language' element={<Menu_Language />} />
      <Route path='/menu_table' element={<Menu_Table />} />
      <Route path='/cus_order' element={<Cus_order />} />
      <Route path='/cus_options' element={<Cus_options />} />
      <Route path='/owner_home_first' element={<Owner_home_first />} />
      <Route path='/menu_english' element={<Menu_English />} />
      <Route path='/menu_japanese' element={<Menu_Japanese />} />
      <Route path='/menu_chinese' element={<Menu_Chinese />} />
      <Route path='/owner_qr' element={<Owner_QR />} />
    </Routes>
    </BrowserRouter>
  )
}


export default App
