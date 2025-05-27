import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaRegKeyboard } from "react-icons/fa6";
import { FaRegArrowAltCircleUp } from "react-icons/fa";

const PopUpModal = ({ onClose, onSubmit }) => {
    const [inputValue, setInputValue] = useState('');
    const [observation, setObservation] = useState('');

    const handleNumberClick = (num) => {
        setInputValue(prev => prev + num);
    };

    const handleClear = () => {
        setInputValue('');
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(inputValue);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white rounded-2xl shadow-xl w-92 max-w-md">
                <div className="bg-[#E6AC27] rounded-t-2xl p-4 flex justify-between">
                    <h2 className="text-xl font-semibold text-white">Insira o nrm de clientes</h2>
                    <IoMdClose size={25} color='white' onClick={onClose} className='cursor-pointer' />
                </div>

                <div className="p-4">
                    <input
                        type='text'
                        placeholder='Insira o nrm de clientes'
                        value={inputValue}
                        onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, '');
                            setInputValue(onlyNums);
                        }}
                        className='w-full border border-gray-300 p-2 focus:outline-none rounded-lg'
                    />

                    <div className='mt-4 flex flex-row gap-4 items-center'>
                        <p className='font-bold uppercase'>Obs</p>
                        <input
                            type='text'
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            className='focus:outline-none border border-gray-300 p-1 w-full rounded-lg'
                        />
                        <FaRegKeyboard color='gray' size={35} />
                    </div>

                    <div className='mt-4 flex flex-col justify-center'>
                        {/* Linha 1 */}
                        <div className='flex flex-row gap-2'>
                            {[7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    className='p-2 w-20 h-20 rounded-lg bg-gray-200 flex justify-center items-center text-xl'
                                    onClick={() => handleNumberClick(num.toString())}
                                >
                                    {num}
                                </button>
                            ))}
                            <div
                                className='p-2 w-20 h-20 rounded-lg bg-[#94c465] flex justify-center items-center cursor-pointer'
                                onClick={handleSubmit}
                            >
                                <FaRegArrowAltCircleUp color='white' size={30} />
                            </div>
                        </div>

                        {/* Linha 2 */}
                        <div className='flex flex-row gap-2 mt-2'>
                            {[4, 5, 6].map(num => (
                                <button
                                    key={num}
                                    className='p-2 w-20 h-20 rounded-lg bg-gray-200 flex justify-center items-center text-xl'
                                    onClick={() => handleNumberClick(num.toString())}
                                >
                                    {num}
                                </button>
                            ))}
                            <div
                                className='p-2 w-20 h-20 rounded-lg bg-red-400 flex justify-center items-center uppercase font-bold text-white cursor-pointer'
                                onClick={handleClear}
                            >
                                C
                            </div>
                        </div>

                        {/* Linha 3 */}
                        <div className='flex flex-row gap-2'>
                            <div className='flex flex-col'>
                                <div className='flex flex-row gap-1.5 mt-2'>
                                    {[1, 2, 3].map(num => (
                                        <button
                                            key={num}
                                            className='p-2 w-20 h-20 rounded-lg bg-gray-200 flex justify-center items-center text-xl'
                                            onClick={() => handleNumberClick(num.toString())}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <div className='flex flex-row gap-1 mt-2'>
                                    <button
                                        className='p-2 w-42 h-20 rounded-lg bg-gray-200 flex justify-center items-center text-xl'
                                        onClick={() => handleNumberClick('0')}
                                    >
                                        0
                                    </button>
                                    <button
                                        className='p-2 w-20 h-20 rounded-lg bg-gray-200 flex justify-center items-center text-xl'
                                        onClick={() => handleNumberClick('00')}
                                    >
                                        00
                                    </button>
                                </div>
                            </div>
                            <button
                                className='p-4 w-20 h-42 rounded-lg bg-[#94c465] flex justify-center items-center mt-2 uppercase font-bold text-white'
                                onClick={handleSubmit}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopUpModal;
