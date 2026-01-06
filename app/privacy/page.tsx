import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "개인정보처리방침 - Playtart",
  description: "Playtart 개인정보처리방침",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">개인정보처리방침</h1>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="text-muted-foreground">
          Playtart(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다.
          회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며,
          개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
        </p>
        <p className="text-sm text-muted-foreground">시행일자: 2025년 1월 5일</p>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>1. 수집하는 개인정보 항목</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">회원가입 시 수집 항목</h4>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>필수: 이메일 주소, 비밀번호</li>
                <li>선택: 이름, 프로필 사진, 연락처</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">소셜 로그인 시 수집 항목</h4>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>Google: 이메일, 이름, 프로필 사진</li>
                <li>Kakao: 이메일, 닉네임, 프로필 사진</li>
                <li>Naver: 이메일, 이름, 프로필 사진</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">서비스 이용 시 자동 수집 항목</h4>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>서비스 이용 기록 (페이지 조회, 클릭, 검색어)</li>
                <li>접속 일시 및 체류 시간</li>
                <li>기기 정보 (브라우저 종류, 운영체제)</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                ※ IP 주소는 수집하지 않습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>2. 개인정보의 수집 및 이용 목적</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li><strong>회원 관리:</strong> 회원 식별, 가입 의사 확인, 본인 확인, 부정 이용 방지</li>
              <li><strong>서비스 제공:</strong> 강의 수강, 외주 서비스 의뢰, 제품 구매, 콘텐츠 제공</li>
              <li><strong>결제 처리:</strong> 유료 서비스 이용 시 결제 및 환불 처리</li>
              <li><strong>고객 지원:</strong> 문의 응대, 공지사항 전달, 분쟁 조정</li>
              <li><strong>서비스 개선:</strong> 이용 통계 분석, 서비스 품질 향상, 신규 서비스 개발</li>
              <li><strong>마케팅:</strong> 이벤트 및 프로모션 안내 (동의 시에만)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>3. 개인정보의 보유 및 이용 기간</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 관계 법령에 의해 보존할 필요가 있는 경우 아래와 같이 보관합니다.
            </p>
            <div className="rounded-lg border p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left">보존 항목</th>
                    <th className="pb-2 text-left">보존 기간</th>
                    <th className="pb-2 text-left">근거 법령</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2">계약 또는 청약철회 기록</td>
                    <td>5년</td>
                    <td>전자상거래법</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">대금결제 및 재화 공급 기록</td>
                    <td>5년</td>
                    <td>전자상거래법</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">소비자 불만 또는 분쟁 처리 기록</td>
                    <td>3년</td>
                    <td>전자상거래법</td>
                  </tr>
                  <tr>
                    <td className="py-2">서비스 이용 기록</td>
                    <td>1년</td>
                    <td>통신비밀보호법</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>4. 개인정보의 제3자 제공</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>5. 개인정보 처리의 위탁</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.
            </p>
            <div className="mt-4 rounded-lg border p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left">수탁업체</th>
                    <th className="pb-2 text-left">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2">Supabase Inc.</td>
                    <td>회원 데이터 저장 및 인증 처리</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Vercel Inc.</td>
                    <td>웹 서비스 호스팅</td>
                  </tr>
                  <tr>
                    <td className="py-2">토스페이먼츠(예정)</td>
                    <td>결제 처리</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>6. 이용자의 권리와 행사 방법</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              위 권리 행사는 마이페이지에서 직접 처리하거나, 이메일을 통해 요청하실 수 있습니다.
              회사는 지체 없이 조치하겠습니다.
            </p>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>7. 쿠키 및 자동 수집 장치의 운영</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              회사는 이용자에게 맞춤 서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는
              기술을 사용할 수 있습니다.
            </p>
            <div>
              <h4 className="font-semibold">사용 목적</h4>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>로그인 상태 유지</li>
                <li>서비스 이용 통계 분석</li>
                <li>맞춤형 서비스 제공</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">수집 거부 방법</h4>
              <p className="text-muted-foreground">
                브라우저 설정에서 쿠키를 차단할 수 있습니다. 다만, 쿠키를 차단할 경우
                일부 서비스 이용에 제한이 있을 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>8. 개인정보의 안전성 확보 조치</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              <li><strong>관리적 조치:</strong> 개인정보 취급 직원의 최소화 및 교육</li>
              <li><strong>기술적 조치:</strong> 개인정보의 암호화, 보안 프로그램 설치, 접근 권한 관리</li>
              <li><strong>물리적 조치:</strong> 클라우드 서비스 보안 인증 확인</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>9. 개인정보 보호책임자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              이용자의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="mt-4 rounded-lg border p-4">
              <p><strong>개인정보 보호책임자</strong></p>
              <p className="text-muted-foreground">성명: 이건우</p>
              <p className="text-muted-foreground">이메일: support@play-t.art</p>
            </div>
            <div className="mt-4 rounded-lg border p-4">
              <p><strong>사업자 정보</strong></p>
              <p className="text-muted-foreground">상호: 플레이타르트</p>
              <p className="text-muted-foreground">대표: 이건우</p>
              <p className="text-muted-foreground">사업자등록번호: 563-05-02993</p>
              <p className="text-muted-foreground">주소: 서울특별시 성북구 장위로19길 25, 2동 403호</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>개인정보침해신고센터 (privacy.kisa.or.kr / 118)</li>
              <li>대검찰청 사이버수사과 (www.spo.go.kr / 1301)</li>
              <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 182)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>10. 개인정보처리방침의 변경</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              이 개인정보처리방침은 2025년 1월 5일부터 적용됩니다.
              법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있을 경우에는
              변경사항 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
