import type * as React from 'react'
import { useState } from 'react'

interface AnimatedIconProps {
  selected: boolean
  selectedSrc: string
  unselectedSrc: string
  selectedClassName?: string
  unselectedClassName?: string
  containerClassName?: string
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  selected,
  selectedSrc,
  unselectedSrc,
  selectedClassName = '',
  unselectedClassName = '',
  containerClassName = 'w-6.5 h-6.5',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${containerClassName}`}>
      <img
        src={selectedSrc}
        alt=""
        className={`transition-all duration-300 ease-in-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          selected
            ? `opacity-100 scale-100 ${selectedClassName}`
            : `opacity-0 scale-50 ${selectedClassName}`
        }`}
      />
      <img
        src={unselectedSrc}
        alt=""
        className={`transition-all duration-300 ease-in-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          !selected
            ? `opacity-100 scale-100 ${unselectedClassName}`
            : `opacity-0 scale-50 ${unselectedClassName}`
        }`}
      />
    </div>
  )
}

const Deploy: React.FC = () => {
  const [selectedEnvironment, setSelectedEnvironment]
    = useState<string>('cloud')

  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-[#80bdff] overflow-hidden w-full">
      {/* 头部 */}
      <div className="flex items-center justify-between h-15 bg-[#eff6ff] px-[26.67px]">
        <div className="flex items-center gap-2">
          <span className="text-[#1D4ED8] text-lg font-semibold">
            请选择您的部署环境
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 bg-[#DBEAFE] text-[#2563EB] text-[13px] px-2.5 py-1 rounded-md">
          步骤 3/3
        </div>
      </div>
      {/* 内容 */}

      <div className="flex flex-col gap-4.25 p-10.5 overflow-x-auto">
        <div
          className={`relative w-218.75 h-74.5 rounded-2xl p-6.25 cursor-pointer duration-200 ${selectedEnvironment === 'cloud' ? '' : 'mourn-mode'}`}
          onClick={() => setSelectedEnvironment('cloud')}
        >
          <img
            className="w-full h-full absolute top-0 left-0"
            src="/card/deploy/私有化一体机交付-背景图片1.svg"
            alt=""
          />

          <img
            className="w-full h-full absolute top-0 left-0 z-5 pointer-events-none"
            src="/card/deploy/私有化一体机交付-背景图片2.svg"
            alt=""
          />
          <div className="flex gap-2.5 relative z-1">
            <div>
              <img
                className="w-11.25 h-11.25"
                src="/card/deploy/私有化一体机交付-图标.png"
                alt="图标"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="font-bold text-white text-[18px]">
                私有化一体机交付 (On-Premise)
              </div>
              <div className="font-medium text-white text-[12px]">
                数据不出域，高性能算力硬件私有化部署，适合高安全等级与内网环境。
              </div>
            </div>
            <div className="shrink-0 flex items-center">
              <AnimatedIcon
                selected={selectedEnvironment === 'cloud'}
                selectedSrc="/card/deploy/私有化一体机交付-选中效果.svg"
                unselectedSrc="/card/deploy/私有化一体机交付-未选中效果.svg"
                selectedClassName="w-6.5 h-6.5"
                unselectedClassName="w-4.75 h-4.75"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-4.5 pl-4.5">
            <div className="flex gap-2 items-center rounded-md relative">
              <img
                src="/card/deploy/私有化一体机交付-背景图片3.svg"
                className="w-57.75 h-9.5 relative z-0"
                alt=""
              />
              <div className="w-full h-full absolute top-0 left-0 z-1 flex gap-2.25 items-center px-2.5">
                <img src="/card/deploy/私有化一体机交付-桌面级 1PFLOP 算力.svg" alt="" />
                <span className="text-[12px]">桌面级 1PFLOP 算力</span>
              </div>
            </div>
            <div className="flex gap-2 items-center rounded-md relative">
              <img
                src="/card/deploy/私有化一体机交付-背景图片3.svg"
                className="w-57.75 h-9.5 relative z-0"
                alt=""
              />
              <div className="w-full h-full absolute top-0 left-0 z-1 flex gap-2.25 items-center px-2.5">
                <img src="/card/deploy/私有化一体机交付-数据隐私安全.svg" alt="" />
                <span className="text-[12px]">数据隐私安全</span>
              </div>
            </div>
            <div className="flex gap-2 items-center rounded-md relative">
              <img
                src="/card/deploy/私有化一体机交付-背景图片3.svg"
                className="w-57.75 h-9.5 relative z-0"
                alt=""
              />
              <div className="w-full h-full absolute top-0 left-0 z-1 flex gap-2.25 items-center px-2.5">
                <img src="/card/deploy/私有化一体机交付-即刻交付.svg" alt="" />
                <span className="text-[12px]">即刻交付</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center rounded-md relative mt-2.5">
            <img
              src="/card/deploy/私有化一体机交付-背景图片4.svg"
              className="w-96.5 h-9 relative z-0"
              alt=""
            />
            <div className="w-full h-full absolute top-0 left-0 z-1 flex gap-2.25 items-center px-2.5">
              <img src="/card/deploy/私有化一体机交付-全新.svg" alt="" />
              <span className="text-[12px]">
                支持一次购置/租货/分期，含首年运维与专家上门支持。
              </span>
            </div>
          </div>

          <img
            src="/card/deploy/私有化一体机交付-宣传图.svg"
            className="absolute bottom-0 right-0"
            alt=""
          />

          <img
            src="/card/deploy/私有化一体机交付-官方推荐.svg"
            className="absolute top-px right-px"
            alt=""
          />
        </div>

        <div
          className={`relative w-218.75 h-58.25 rounded-2xl p-6.25 cursor-pointer duration-200 ${selectedEnvironment === 'staging' ? '' : 'mourn-mode'}`}
          onClick={() => setSelectedEnvironment('staging')}
        >
          <img
            className="w-full h-full absolute top-0 left-0"
            src="/card/deploy/平台云托管-背景图片.svg"
            alt=""
          />
          <div className="flex gap-2.5 relative z-1">
            <div>
              <img
                className="w-9.75 h-9.75"
                src="/card/deploy/平台云托管-图标.svg"
                alt="图标"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="font-bold text-[#2563EB] text-[18px] leading-6">
                平台云托管 (SaaS)
              </div>
              <div className="font-bold text-[#6b7280] text-[12px]">
                即开即用，基于云端算力集群，弹性扩缩容，适合快速验证与公网服务。
              </div>
            </div>
            <div className="shrink-0 flex items-center">
              <AnimatedIcon
                selected={selectedEnvironment === 'staging'}
                selectedSrc="/card/deploy/平台云托管-选中效果.svg"
                unselectedSrc="/card/deploy/平台云托管-未选中效果.svg"
                selectedClassName="w-6.5 h-6.5"
                unselectedClassName="w-4.5 h-4.5"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-4.5 pl-4.5">
            <div className="flex gap-2 items-center rounded-md relative h-9">
              <div
                className="w-58 h-full absolute top-0 left-0 z-1 flex gap-2.25 items-center px-2.5 bg-white rounded-md"
                style={{
                  boxShadow: '0 7.5px 11.25px -2.25px rgba(82, 134, 255, 0.05)',
                }}
              >
                <div
                  className=" absolute top-0 left-0 w-full h-full rounded-md"
                  style={{
                    boxShadow: '0 3px 4.5px -3px rgba(82, 134, 255, 0.05)',
                  }}
                >
                </div>
                <img src="/card/deploy/平台云托管-分钟级部署.svg" alt="" />
                <span className="text-[12px]">分钟级部署</span>
              </div>
            </div>
            <div className="flex gap-2 items-center rounded-md relative h-9">
              <div
                className="w-58 h-full absolute top-0 left-0 z-1 flex gap-2.25 items-center px-2.5 bg-white rounded-md"
                style={{
                  boxShadow: '0 7.5px 11.25px -2.25px rgba(82, 134, 255, 0.05)',
                }}
              >
                <div
                  className=" absolute top-0 left-0 w-full h-full rounded-md"
                  style={{
                    boxShadow: '0 3px 4.5px -3px rgba(82, 134, 255, 0.05)',
                  }}
                >
                </div>
                <img src="/card/deploy/平台云托管-按量付费.svg" alt="" />
                <span className="text-[12px]">按量付费</span>
              </div>
            </div>
            <div className="flex gap-2 items-center rounded-md relative h-9">
              <div
                className="w-58 h-full absolute top-0 left-0 z-1 flex gap-2.25 items-center px-2.5 bg-white rounded-md"
                style={{
                  boxShadow: '0 7.5px 11.25px -2.25px rgba(82, 134, 255, 0.05)',
                }}
              >
                <div
                  className=" absolute top-0 left-0 w-full h-full rounded-md"
                  style={{
                    boxShadow: '0 3px 4.5px -3px rgba(82, 134, 255, 0.05)',
                  }}
                >
                </div>
                <img src="/card/deploy/平台云托管-API直连.svg" alt="" />
                <span className="text-[12px]">API直连</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-218.75 h-17.5 rounded-3xl bg-linear-to-br from-[#25D9F9] to-[#2563EB] flex items-center justify-center text-white text-[18px] font-medium cursor-pointer">
          进行下一步支付确认
        </div>
      </div>
    </div>
  )
}

export default Deploy
