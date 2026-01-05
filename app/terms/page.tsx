import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "이용약관 - Playtart",
  description: "Playtart 서비스 이용약관",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">서비스 이용약관</h1>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="text-muted-foreground">
          본 약관은 Playtart(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의
          권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
        </p>
        <p className="text-sm text-muted-foreground">시행일자: 2025년 1월 5일</p>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제1조 (목적)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              본 약관은 회사가 운영하는 웹사이트 Playtart(play-t.art)에서 제공하는 온라인 강의,
              디지털 콘텐츠 판매, 외주 서비스 중개 등 제반 서비스(이하 "서비스")의 이용과 관련하여
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제2조 (정의)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                <strong>"서비스"</strong>란 회사가 제공하는 픽셀아트 강의, 디지털 에셋 판매,
                외주 서비스 중개, 커뮤니티 등 일체의 서비스를 의미합니다.
              </li>
              <li>
                <strong>"회원"</strong>이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결하여
                회원 계정을 부여받은 자를 의미합니다.
              </li>
              <li>
                <strong>"콘텐츠"</strong>란 회사 또는 회원이 서비스에 게시한 강의, 에셋, 게시물 등
                모든 형태의 정보를 의미합니다.
              </li>
              <li>
                <strong>"디지털 콘텐츠"</strong>란 스프라이트, 타일셋, UI 팩 등 다운로드 가능한
                디지털 파일을 의미합니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제3조 (약관의 효력 및 변경)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>본 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.</li>
              <li>
                회사는 필요한 경우 관련 법령을 위반하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.
              </li>
              <li>
                약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 공지합니다.
                다만, 회원에게 불리한 변경의 경우 30일 전부터 공지합니다.
              </li>
              <li>
                회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제4조 (회원가입)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는
                의사표시를 함으로써 회원가입을 신청합니다.
              </li>
              <li>
                회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한
                회원으로 등록합니다.
                <ul className="mt-2 list-disc pl-5">
                  <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>기타 회원으로 등록하는 것이 회사의 서비스 운영에 현저한 지장이 있다고 판단되는 경우</li>
                </ul>
              </li>
              <li>회원은 등록사항에 변경이 있는 경우 즉시 회원정보를 수정해야 합니다.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제5조 (서비스의 제공)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                회사는 다음과 같은 서비스를 제공합니다.
                <ul className="mt-2 list-disc pl-5">
                  <li>픽셀아트 관련 온라인 강의 서비스</li>
                  <li>디지털 에셋(스프라이트, 타일셋 등) 판매 서비스</li>
                  <li>픽셀아트 외주 제작 중개 서비스</li>
                  <li>커뮤니티 게시판 서비스</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </li>
              <li>
                회사는 서비스를 일정 범위로 분할하여 각 범위별로 이용 가능 시간을 별도로 지정할 수 있습니다.
              </li>
              <li>
                서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 다만, 시스템 점검 등의 사유로
                서비스가 일시 중단될 수 있습니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제6조 (유료 서비스 및 결제)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                회사가 제공하는 유료 서비스를 이용하는 경우 회원은 이용대금을 납부한 후 해당 서비스를
                이용할 수 있습니다.
              </li>
              <li>
                유료 서비스의 결제방법은 신용카드, 계좌이체, 간편결제 등 회사가 정하는 방법으로 합니다.
              </li>
              <li>
                디지털 콘텐츠의 경우 구매 후 다운로드가 이루어지면 청약철회가 제한될 수 있습니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제7조 (청약철회 및 환불)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                <strong>온라인 강의:</strong> 구매 후 7일 이내에 수강을 시작하지 않은 경우 전액 환불이 가능합니다.
                수강을 시작한 경우 진도율에 따라 부분 환불됩니다.
              </li>
              <li>
                <strong>디지털 콘텐츠:</strong> 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라
                다운로드가 시작된 경우 청약철회가 제한됩니다. 다만, 콘텐츠에 하자가 있는 경우 교환 또는
                환불이 가능합니다.
              </li>
              <li>
                <strong>외주 서비스:</strong> 작업 착수 전에는 전액 환불이 가능합니다.
                작업 착수 후에는 진행 정도에 따라 부분 환불됩니다.
              </li>
              <li>환불은 원칙적으로 결제 시 사용한 수단으로 진행됩니다.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제8조 (회원의 의무)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>가입 신청 또는 변경 시 허위 내용을 등록하는 행위</li>
              <li>타인의 정보를 도용하는 행위</li>
              <li>회사가 게시한 정보를 무단으로 변경하는 행위</li>
              <li>회사가 정한 정보 이외의 정보를 송신하거나 게시하는 행위</li>
              <li>회사와 기타 제3자의 저작권 등 지적재산권을 침해하는 행위</li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성 등을 공개 또는 게시하는 행위</li>
              <li>구매한 콘텐츠를 무단으로 재배포하거나 판매하는 행위</li>
              <li>기타 불법적이거나 부당한 행위</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제9조 (저작권의 귀속)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                회사가 제작한 서비스 내의 콘텐츠에 대한 저작권 및 기타 지적재산권은 회사에 귀속됩니다.
              </li>
              <li>
                회원이 구매한 디지털 콘텐츠는 개인 또는 상업적 프로젝트에 사용할 수 있으나,
                콘텐츠 자체를 재판매하거나 무료로 배포할 수 없습니다.
              </li>
              <li>
                회원이 서비스 내에 게시한 게시물의 저작권은 해당 회원에게 귀속됩니다.
                다만, 회사는 서비스 운영, 홍보 등의 목적으로 회원의 게시물을 사용할 수 있습니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제10조 (서비스 이용의 제한 및 정지)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우
                서비스 이용을 제한하거나 정지할 수 있습니다.
              </li>
              <li>
                회사는 전항에도 불구하고, 저작권법 위반, 불법 행위 등 관계 법령 위반으로 인해
                서비스 이용을 즉시 정지할 수 있습니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제11조 (회원 탈퇴 및 자격 상실)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                회원은 언제든지 마이페이지에서 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.
              </li>
              <li>
                회원 탈퇴 시 보유하고 있던 포인트, 쿠폰 등은 즉시 소멸되며, 이미 구매한 강의의 수강 권한도
                상실됩니다.
              </li>
              <li>
                탈퇴 후에도 회원이 작성한 게시물은 삭제되지 않으며, 삭제를 원할 경우 탈퇴 전에 직접
                삭제해야 합니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제12조 (면책조항)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                회사는 천재지변, 전쟁 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우
                서비스 제공에 관한 책임이 면제됩니다.
              </li>
              <li>
                회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
              </li>
              <li>
                회사는 회원이 서비스에 게재한 정보, 자료, 사실의 신뢰도, 정확성 등에 관하여
                책임을 지지 않습니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle>제13조 (분쟁 해결)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                회사와 회원 간 발생한 분쟁에 관한 소송은 대한민국 법을 적용하며,
                서울중앙지방법원을 전속 관할 법원으로 합니다.
              </li>
              <li>
                회사와 회원 간 발생한 분쟁에 대해서는 한국소비자원 등 분쟁조정기관의
                조정 절차를 거칠 수 있습니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="my-6 border-primary">
          <CardHeader>
            <CardTitle>부칙</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              본 약관은 2025년 1월 5일부터 시행됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
