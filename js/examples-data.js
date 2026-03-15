// ════════════════════════════════════════════
//  EXAMPLES
// ════════════════════════════════════════════
const EXAMPLES = {

  // ── DATA TRANSFORMATION ──────────────────────────────────────────

  identityTransform: {
    label: 'Identity Transform',
    icon: '🔁',
    desc: 'Copy XML as-is — foundation for all CPI mappings',
    cat:  'transform',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<SalesOrder>
  <Header>
    <OrderId>SO-2024-001</OrderId>
    <Customer>C-10042</Customer>
    <OrderDate>2024-03-15</OrderDate>
    <Currency>USD</Currency>
  </Header>
  <Items>
    <Item>
      <LineNo>10</LineNo>
      <Material>MAT-001</Material>
      <Qty>5</Qty>
      <UnitPrice>120.00</UnitPrice>
    </Item>
    <Item>
      <LineNo>20</LineNo>
      <Material>MAT-002</Material>
      <Qty>3</Qty>
      <UnitPrice>85.50</UnitPrice>
    </Item>
  </Items>
</SalesOrder>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Identity Transform — copies every node and attribute unchanged.
    The foundation for all CPI mappings: start here, then override
    only the templates you need to modify.
  -->

  <xsl:template match="@* | node()">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>

</xsl:stylesheet>`
  },

  renameElements: {
    label: 'Rename Elements & Attributes',
    icon: '✏️',
    desc: 'Map SAP IDoc MATMAS fields to target REST format',
    cat:  'transform',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<MATMAS>
  <MATNR>000000000000012345</MATNR>
  <MAKTX>Hydraulic Pump 50bar</MAKTX>
  <MEINS>EA</MEINS>
  <MTART>FERT</MTART>
  <MATKL>01010</MATKL>
  <BRGEW>12.500</BRGEW>
  <GEWEI>KG</GEWEI>
  <NTGEW>11.200</NTGEW>
</MATMAS>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Rename SAP MATMAS IDoc fields to a target REST API format.
    Pattern: one template per renamed element using push-style processing.
  -->

  <xsl:template match="MATMAS">
    <MaterialMaster>
      <xsl:apply-templates/>
    </MaterialMaster>
  </xsl:template>

  <xsl:template match="MATNR">
    <materialNumber><xsl:value-of select="normalize-space(.)"/></materialNumber>
  </xsl:template>

  <xsl:template match="MAKTX">
    <description><xsl:value-of select="."/></description>
  </xsl:template>

  <xsl:template match="MEINS">
    <baseUnitOfMeasure><xsl:value-of select="."/></baseUnitOfMeasure>
  </xsl:template>

  <xsl:template match="MTART">
    <materialType><xsl:value-of select="."/></materialType>
  </xsl:template>

  <xsl:template match="MATKL">
    <materialGroup><xsl:value-of select="."/></materialGroup>
  </xsl:template>

  <xsl:template match="BRGEW">
    <grossWeight unit="{../GEWEI}">
      <xsl:value-of select="format-number(xs:decimal(.), '#,##0.000')"/>
    </grossWeight>
  </xsl:template>

  <xsl:template match="NTGEW">
    <netWeight unit="{../GEWEI}">
      <xsl:value-of select="format-number(xs:decimal(.), '#,##0.000')"/>
    </netWeight>
  </xsl:template>

  <!-- Suppress GEWEI — already consumed as attribute above -->
  <xsl:template match="GEWEI"/>

</xsl:stylesheet>`
  },

  filterNodes: {
    label: 'Filter / Conditional Output',
    icon: '🔍',
    desc: 'Keep only nodes matching multi-field conditions',
    cat:  'transform',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Employees>
  <Employee>
    <EmpId>E001</EmpId>
    <Name>Alice Martin</Name>
    <Department>IT</Department>
    <Status>Active</Status>
    <Salary>85000</Salary>
  </Employee>
  <Employee>
    <EmpId>E002</EmpId>
    <Name>Bob Chen</Name>
    <Department>Finance</Department>
    <Status>Inactive</Status>
    <Salary>72000</Salary>
  </Employee>
  <Employee>
    <EmpId>E003</EmpId>
    <Name>Carol Smith</Name>
    <Department>IT</Department>
    <Status>Active</Status>
    <Salary>91000</Salary>
  </Employee>
  <Employee>
    <EmpId>E004</EmpId>
    <Name>David Lee</Name>
    <Department>IT</Department>
    <Status>Active</Status>
    <Salary>67000</Salary>
  </Employee>
</Employees>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Filter: keep only Active IT employees with Salary > 70000.
    Use xsl:apply-templates with a predicate — clean and composable.
    Common in CPI for pre-filtering payloads before routing.
  -->

  <xsl:template match="Employees">
    <ActiveITEmployees count="{count(Employee[Status='Active' and Department='IT' and xs:decimal(Salary) gt 70000])}">
      <xsl:apply-templates select="Employee[
        Status = 'Active' and
        Department = 'IT' and
        xs:decimal(Salary) gt 70000
      ]"/>
    </ActiveITEmployees>
  </xsl:template>

  <xsl:template match="Employee">
    <Employee id="{EmpId}">
      <Name><xsl:value-of select="Name"/></Name>
      <Department><xsl:value-of select="Department"/></Department>
      <Salary currency="USD">
        <xsl:value-of select="format-number(xs:decimal(Salary), '#,##0')"/>
      </Salary>
    </Employee>
  </xsl:template>

</xsl:stylesheet>`
  },

  namespaceHandling: {
    label: 'Namespace Handling',
    icon: '🏷️',
    desc: 'Strip ns prefixes, remap namespaces, enrich inline',
    cat:  'transform',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<ns0:Order xmlns:ns0="http://acme.com/order/v1"
           xmlns:ns1="http://acme.com/common/v1">
  <ns0:Header>
    <ns1:Id>ORD-2024-9987</ns1:Id>
    <ns1:Date>2024-11-01</ns1:Date>
    <ns0:Priority>HIGH</ns0:Priority>
  </ns0:Header>
  <ns0:Lines>
    <ns0:Line>
      <ns1:Product>PUMP-50</ns1:Product>
      <ns0:Quantity>2</ns0:Quantity>
      <ns0:Price>1450.00</ns0:Price>
    </ns0:Line>
    <ns0:Line>
      <ns1:Product>VALVE-12</ns1:Product>
      <ns0:Quantity>5</ns0:Quantity>
      <ns0:Price>320.00</ns0:Price>
    </ns0:Line>
  </ns0:Lines>
</ns0:Order>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:ns0="http://acme.com/order/v1"
  xmlns:ns1="http://acme.com/common/v1"
  exclude-result-prefixes="xs ns0 ns1">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Strip incoming namespaces and produce a clean, namespace-free XML.
    Very common in SAP CPI when bridging systems with different namespace conventions.
    Uses local-name() to match regardless of prefix.
  -->

  <xsl:template match="*">
    <xsl:element name="{local-name()}">
      <xsl:apply-templates select="@* | node()"/>
    </xsl:element>
  </xsl:template>

  <!-- Strip namespace-prefixed attributes, keep unprefixed ones -->
  <xsl:template match="@*">
    <xsl:if test="not(contains(name(), ':'))">
      <xsl:copy/>
    </xsl:if>
  </xsl:template>

  <!-- Add computed LineTotal to each Line -->
  <xsl:template match="*[local-name() = 'Line']">
    <Line>
      <xsl:apply-templates select="@* | node()"/>
      <LineTotal>
        <xsl:value-of select="format-number(
          xs:decimal(*[local-name()='Quantity']) * xs:decimal(*[local-name()='Price']),
          '#,##0.00')"/>
      </LineTotal>
    </Line>
  </xsl:template>

</xsl:stylesheet>`
  },

  // ── AGGREGATION & SPLITTING ──────────────────────────────────────

  groupBy: {
    label: 'Group-by & Aggregate',
    icon: '📦',
    desc: 'Nested grouping with subtotals — xsl:for-each-group',
    cat:  'aggregation',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<SalesData>
  <Sale><Region>North</Region><Product>Pump</Product><Amount>12500</Amount></Sale>
  <Sale><Region>South</Region><Product>Valve</Product><Amount>8300</Amount></Sale>
  <Sale><Region>North</Region><Product>Valve</Product><Amount>4200</Amount></Sale>
  <Sale><Region>South</Region><Product>Pump</Product><Amount>17800</Amount></Sale>
  <Sale><Region>North</Region><Product>Pump</Product><Amount>9100</Amount></Sale>
  <Sale><Region>East</Region><Product>Pipe</Product><Amount>6700</Amount></Sale>
  <Sale><Region>South</Region><Product>Pump</Product><Amount>11200</Amount></Sale>
  <Sale><Region>East</Region><Product>Valve</Product><Amount>5400</Amount></Sale>
</SalesData>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Group sales by Region, compute total and count per group.
    xsl:for-each-group is essential for CPI aggregation scenarios.
    Also demonstrates nested grouping (Region > Product).
  -->

  <xsl:template match="SalesData">
    <SalesSummary generatedAt="{current-dateTime()}">
      <xsl:for-each-group select="Sale" group-by="Region">
        <xsl:sort select="current-grouping-key()"/>
        <Region name="{current-grouping-key()}"
                saleCount="{count(current-group())}">
          <Total>
            <xsl:value-of select="format-number(sum(current-group()/xs:decimal(Amount)), '#,##0.00')"/>
          </Total>
          <xsl:for-each-group select="current-group()" group-by="Product">
            <xsl:sort select="current-grouping-key()"/>
            <Product name="{current-grouping-key()}">
              <xsl:value-of select="format-number(sum(current-group()/xs:decimal(Amount)), '#,##0.00')"/>
            </Product>
          </xsl:for-each-group>
        </Region>
      </xsl:for-each-group>
      <GrandTotal>
        <xsl:value-of select="format-number(sum(Sale/xs:decimal(Amount)), '#,##0.00')"/>
      </GrandTotal>
    </SalesSummary>
  </xsl:template>

</xsl:stylesheet>`
  },

  splitMessage: {
    label: 'Split Message',
    icon: '✂️',
    desc: 'Wrap each record as standalone message with index',
    cat:  'aggregation',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<PurchaseOrders>
  <PurchaseOrder>
    <OrderId>PO-001</OrderId>
    <Vendor>V-100</Vendor>
    <Currency>EUR</Currency>
    <Items>
      <Item><LineNo>10</LineNo><Material>MAT-A</Material><Qty>5</Qty><Price>100</Price></Item>
      <Item><LineNo>20</LineNo><Material>MAT-B</Material><Qty>2</Qty><Price>250</Price></Item>
    </Items>
  </PurchaseOrder>
  <PurchaseOrder>
    <OrderId>PO-002</OrderId>
    <Vendor>V-200</Vendor>
    <Currency>USD</Currency>
    <Items>
      <Item><LineNo>10</LineNo><Material>MAT-C</Material><Qty>10</Qty><Price>75</Price></Item>
    </Items>
  </PurchaseOrder>
</PurchaseOrders>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Split: wrap each PurchaseOrder as a standalone message with envelope.
    In CPI, use this before a Splitter step so each child becomes
    an independent message with its own headers.
    Adds split index and total for downstream tracking.
  -->

  <xsl:variable name="total" select="count(/PurchaseOrders/PurchaseOrder)"/>

  <xsl:template match="/">
    <Messages total="{$total}">
      <xsl:for-each select="PurchaseOrders/PurchaseOrder">
        <Message index="{position()}" of="{$total}">
          <PurchaseOrder>
            <xsl:copy-of select="*"/>
          </PurchaseOrder>
        </Message>
      </xsl:for-each>
    </Messages>
  </xsl:template>

</xsl:stylesheet>`
  },

  mergeMessages: {
    label: 'Merge / Collect Records',
    icon: '🔀',
    desc: 'Flatten nested records, compute open/closed totals',
    cat:  'aggregation',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<CustomerOrders>
  <Customer id="C001">
    <Name>Acme Corp</Name>
    <Orders>
      <Order><Id>ORD-101</Id><Amount>5000</Amount><Status>OPEN</Status></Order>
      <Order><Id>ORD-102</Id><Amount>3200</Amount><Status>CLOSED</Status></Order>
    </Orders>
  </Customer>
  <Customer id="C002">
    <Name>Beta GmbH</Name>
    <Orders>
      <Order><Id>ORD-201</Id><Amount>8900</Amount><Status>OPEN</Status></Order>
    </Orders>
  </Customer>
  <Customer id="C003">
    <Name>Gamma Ltd</Name>
    <Orders>
      <Order><Id>ORD-301</Id><Amount>1200</Amount><Status>OPEN</Status></Order>
      <Order><Id>ORD-302</Id><Amount>4500</Amount><Status>OPEN</Status></Order>
      <Order><Id>ORD-303</Id><Amount>2100</Amount><Status>CLOSED</Status></Order>
    </Orders>
  </Customer>
</CustomerOrders>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Merge/Collect: flatten nested customer orders into a single list.
    Computes open vs closed totals per customer.
    Useful in CPI Gather step post-processing and reporting scenarios.
  -->

  <xsl:template match="CustomerOrders">
    <OrderReport generatedAt="{current-date()}">
      <Summary>
        <TotalCustomers><xsl:value-of select="count(Customer)"/></TotalCustomers>
        <TotalOrders><xsl:value-of select="count(Customer/Orders/Order)"/></TotalOrders>
        <OpenOrders><xsl:value-of select="count(Customer/Orders/Order[Status='OPEN'])"/></OpenOrders>
        <GrandTotal><xsl:value-of select="format-number(sum(Customer/Orders/Order/xs:decimal(Amount)), '#,##0.00')"/></GrandTotal>
      </Summary>
      <Customers>
        <xsl:apply-templates select="Customer"/>
      </Customers>
    </OrderReport>
  </xsl:template>

  <xsl:template match="Customer">
    <Customer id="{@id}" name="{Name}">
      <OpenTotal><xsl:value-of select="format-number(sum(Orders/Order[Status='OPEN']/xs:decimal(Amount)), '#,##0.00')"/></OpenTotal>
      <ClosedTotal><xsl:value-of select="format-number(sum(Orders/Order[Status='CLOSED']/xs:decimal(Amount)), '#,##0.00')"/></ClosedTotal>
      <Orders>
        <xsl:apply-templates select="Orders/Order">
          <xsl:sort select="Status"/>
          <xsl:sort select="xs:decimal(Amount)" order="descending"/>
        </xsl:apply-templates>
      </Orders>
    </Customer>
  </xsl:template>

  <xsl:template match="Order">
    <Order id="{Id}" status="{Status}" amount="{format-number(xs:decimal(Amount), '#,##0.00')}"/>
  </xsl:template>

</xsl:stylesheet>`
  },

  // ── FORMAT CONVERSION ────────────────────────────────────────────

  dateFormatting: {
    label: 'Date Format Conversion',
    icon: '📅',
    desc: 'SAP YYYYMMDD ↔ ISO 8601 ↔ display formats',
    cat:  'format',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Dates>
  <!-- SAP compact format YYYYMMDD -->
  <SAPDate>20241115</SAPDate>
  <!-- ISO 8601 datetime -->
  <ISODate>2024-11-15T08:30:00Z</ISODate>
  <!-- SAP timestamp YYYYMMDDHHMMSS -->
  <SAPTimestamp>20241115083000</SAPTimestamp>
  <!-- Slash format DD/MM/YYYY -->
  <EUDate>15/11/2024</EUDate>
</Dates>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Date conversion patterns common in SAP CPI integrations.
    SAP uses YYYYMMDD and YYYYMMDDHHMMSS — ISO 8601 is the universal bridge.
  -->

  <xsl:template match="Dates">
    <ConvertedDates>

      <!-- SAP YYYYMMDD → ISO 8601 date -->
      <FromSAP>
        <xsl:variable name="y" select="substring(SAPDate, 1, 4)"/>
        <xsl:variable name="m" select="substring(SAPDate, 5, 2)"/>
        <xsl:variable name="d" select="substring(SAPDate, 7, 2)"/>
        <ISO><xsl:value-of select="concat($y, '-', $m, '-', $d)"/></ISO>
        <Display><xsl:value-of select="concat($d, '/', $m, '/', $y)"/></Display>
      </FromSAP>

      <!-- ISO datetime → date components -->
      <FromISO>
        <xsl:variable name="dt" select="xs:dateTime(ISODate)"/>
        <SAPFormat><xsl:value-of select="format-dateTime($dt, '[Y0001][M01][D01]')"/></SAPFormat>
        <Readable><xsl:value-of select="format-dateTime($dt, '[D01] [MNn] [Y0001]')"/></Readable>
        <TimeOnly><xsl:value-of select="format-dateTime($dt, '[H01]:[m01]:[s01]')"/></TimeOnly>
      </FromISO>

      <!-- SAP Timestamp YYYYMMDDHHMMSS → ISO datetime -->
      <FromSAPTimestamp>
        <xsl:variable name="ts" select="SAPTimestamp"/>
        <ISO><xsl:value-of select="concat(
          substring($ts,1,4),'-',substring($ts,5,2),'-',substring($ts,7,2),
          'T',substring($ts,9,2),':',substring($ts,11,2),':',substring($ts,13,2))"/>
        </ISO>
      </FromSAPTimestamp>

      <!-- Add 30 days to today -->
      <ThirtyDaysFromNow>
        <xsl:value-of select="xs:date(substring-before(ISODate,'T')) + xs:dayTimeDuration('P30D')"/>
      </ThirtyDaysFromNow>

    </ConvertedDates>
  </xsl:template>

</xsl:stylesheet>`
  },

  currencyAmount: {
    label: 'Currency & Amount Formatting',
    icon: '💱',
    desc: 'format-number, IBAN validation, negative handling',
    cat:  'format',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Payments>
  <Payment>
    <Id>PAY-001</Id>
    <Amount>1234567.891</Amount>
    <Currency>EUR</Currency>
    <IBAN>DE89370400440532013000</IBAN>
  </Payment>
  <Payment>
    <Id>PAY-002</Id>
    <Amount>-500.5</Amount>
    <Currency>USD</Currency>
    <IBAN>GB29NWBK60161331926819</IBAN>
  </Payment>
  <Payment>
    <Id>PAY-003</Id>
    <Amount>notANumber</Amount>
    <Currency>CHF</Currency>
    <IBAN>INVALID-IBAN</IBAN>
  </Payment>
</Payments>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Currency formatting and basic IBAN validation.
    Handles negative amounts, non-numeric input, and invalid IBANs gracefully.
  -->

  <xsl:template match="Payments">
    <ProcessedPayments>
      <xsl:apply-templates select="Payment"/>
    </ProcessedPayments>
  </xsl:template>

  <xsl:template match="Payment">
    <xsl:variable name="valid" select="Amount castable as xs:decimal"/>
    <Payment id="{Id}">
      <Amount>
        <xsl:choose>
          <xsl:when test="$valid">
            <xsl:value-of select="format-number(xs:decimal(Amount), '#,##0.00')"/>
          </xsl:when>
          <xsl:otherwise>INVALID: <xsl:value-of select="Amount"/></xsl:otherwise>
        </xsl:choose>
      </Amount>
      <Currency><xsl:value-of select="Currency"/></Currency>
      <AbsoluteAmount>
        <xsl:if test="$valid">
          <xsl:value-of select="format-number(abs(xs:decimal(Amount)), '#,##0.00')"/>
        </xsl:if>
      </AbsoluteAmount>
      <IBAN>
        <xsl:variable name="stripped" select="translate(IBAN, ' ', '')"/>
        <xsl:choose>
          <xsl:when test="string-length($stripped) >= 15 and string-length($stripped) &lt;= 34
                          and matches($stripped, '^[A-Z]{2}[0-9]{2}[A-Z0-9]+$')">
            <xsl:value-of select="$stripped"/>
          </xsl:when>
          <xsl:otherwise>INVALID: <xsl:value-of select="IBAN"/></xsl:otherwise>
        </xsl:choose>
      </IBAN>
      <Status>
        <xsl:value-of select="if ($valid and xs:decimal(Amount) gt 0) then 'VALID' else 'REVIEW'"/>
      </Status>
    </Payment>
  </xsl:template>

</xsl:stylesheet>`
  },

  // ── SAP CPI PATTERNS ─────────────────────────────────────────────

  idocToXml: {
    label: 'IDoc ORDERS05 → Custom XML',
    icon: '📄',
    desc: 'Full IDoc parse: control record, header, vendor, items',
    cat:  'cpi',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<ORDERS05>
  <IDOC BEGIN="1">
    <EDI_DC40 SEGMENT="1">
      <TABNAM>EDI_DC40</TABNAM>
      <MANDT>100</MANDT>
      <DOCNUM>0000000000012345</DOCNUM>
      <IDOCTYP>ORDERS05</IDOCTYP>
      <MESTYP>ORDERS</MESTYP>
      <SNDPOR>SAPDEV</SNDPOR>
      <RCVPOR>PARTNER</RCVPOR>
      <CREDAT>20241115</CREDAT>
      <CRETIM>093045</CRETIM>
    </EDI_DC40>
    <E1EDK01 SEGMENT="1">
      <ACTION>004</ACTION>
      <BSART>NB</BSART>
      <BELNR>4500012345</BELNR>
      <NTGEW>25.000</NTGEW>
      <BRGEW>27.500</BRGEW>
      <GEWEI>KG</GEWEI>
    </E1EDK01>
    <E1EDKA1 SEGMENT="1">
      <PARVW>LF</PARVW>
      <PARTN>V-100042</PARTN>
      <LIFNR>V-100042</LIFNR>
      <NAME1>Acme Suppliers GmbH</NAME1>
      <NAME2>Procurement Dept</NAME2>
      <STRAS>Industriestr 42</STRAS>
      <ORT01>Frankfurt</ORT01>
      <PSTLZ>60528</PSTLZ>
      <LAND1>DE</LAND1>
    </E1EDKA1>
    <E1EDP01 SEGMENT="1">
      <POSEX>000010</POSEX>
      <MATNR>000000000000012345</MATNR>
      <MAKTX>Hydraulic Pump 50bar</MAKTX>
      <MENGE>5.000</MENGE>
      <MENEE>EA</MENEE>
      <NETWR>5750.00</NETWR>
      <WAERS>EUR</WAERS>
    </E1EDP01>
    <E1EDP01 SEGMENT="1">
      <POSEX>000020</POSEX>
      <MATNR>000000000000067890</MATNR>
      <MAKTX>Control Valve DN50</MAKTX>
      <MENGE>10.000</MENGE>
      <MENEE>EA</MENEE>
      <NETWR>1200.00</NETWR>
      <WAERS>EUR</WAERS>
    </E1EDP01>
  </IDOC>
</ORDERS05>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Transform SAP IDoc ORDERS05 to a canonical Purchase Order XML
    for downstream REST/SOAP systems.
    Maps control record (EDI_DC40), header (E1EDK01), partner (E1EDKA1)
    and line items (E1EDP01).
  -->

  <xsl:template match="ORDERS05">
    <xsl:apply-templates select="IDOC"/>
  </xsl:template>

  <xsl:template match="IDOC">
    <xsl:variable name="dc"     select="EDI_DC40"/>
    <xsl:variable name="header" select="E1EDK01"/>
    <xsl:variable name="vendor" select="E1EDKA1[PARVW='LF']"/>

    <PurchaseOrder>
      <DocumentNumber><xsl:value-of select="normalize-space($dc/DOCNUM)"/></DocumentNumber>
      <OrderNumber><xsl:value-of select="$header/BELNR"/></OrderNumber>
      <OrderType><xsl:value-of select="$header/BSART"/></OrderType>
      <CreatedAt>
        <xsl:value-of select="concat(
          substring($dc/CREDAT,1,4),'-',
          substring($dc/CREDAT,5,2),'-',
          substring($dc/CREDAT,7,2),'T',
          substring($dc/CRETIM,1,2),':',
          substring($dc/CRETIM,3,2),':',
          substring($dc/CRETIM,5,2))"/>
      </CreatedAt>

      <Vendor id="{$vendor/LIFNR}">
        <Name><xsl:value-of select="$vendor/NAME1"/></Name>
        <Department><xsl:value-of select="$vendor/NAME2"/></Department>
        <Address>
          <Street><xsl:value-of select="$vendor/STRAS"/></Street>
          <City><xsl:value-of select="$vendor/ORT01"/></City>
          <PostalCode><xsl:value-of select="$vendor/PSTLZ"/></PostalCode>
          <Country><xsl:value-of select="$vendor/LAND1"/></Country>
        </Address>
      </Vendor>

      <LineItems count="{count(E1EDP01)}">
        <xsl:apply-templates select="E1EDP01"/>
      </LineItems>

      <Totals>
        <NetValue currency="{E1EDP01[1]/WAERS}">
          <xsl:value-of select="format-number(sum(E1EDP01/xs:decimal(NETWR)), '#,##0.00')"/>
        </NetValue>
      </Totals>
    </PurchaseOrder>
  </xsl:template>

  <xsl:template match="E1EDP01">
    <Item line="{normalize-space(POSEX)}">
      <MaterialNumber><xsl:value-of select="normalize-space(MATNR)"/></MaterialNumber>
      <Description><xsl:value-of select="MAKTX"/></Description>
      <Quantity unit="{MENEE}"><xsl:value-of select="format-number(xs:decimal(MENGE), '#,##0.###')"/></Quantity>
      <NetValue currency="{WAERS}"><xsl:value-of select="format-number(xs:decimal(NETWR), '#,##0.00')"/></NetValue>
      <UnitPrice currency="{WAERS}">
        <xsl:value-of select="format-number(xs:decimal(NETWR) div xs:decimal(MENGE), '#,##0.00')"/>
      </UnitPrice>
    </Item>
  </xsl:template>

</xsl:stylesheet>`
  },

  lookupEnrich: {
    label: 'Value Mapping / Lookup',
    icon: '🔗',
    desc: 'Inline lookup tables — replaces CPI Value Mapping step',
    cat:  'cpi',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Orders>
  <Order>
    <Id>ORD-001</Id>
    <StatusCode>A</StatusCode>
    <PriorityCode>1</PriorityCode>
    <CountryCode>DE</CountryCode>
  </Order>
  <Order>
    <Id>ORD-002</Id>
    <StatusCode>B</StatusCode>
    <PriorityCode>2</PriorityCode>
    <CountryCode>US</CountryCode>
  </Order>
  <Order>
    <Id>ORD-003</Id>
    <StatusCode>X</StatusCode>
    <PriorityCode>9</PriorityCode>
    <CountryCode>JP</CountryCode>
  </Order>
</Orders>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  exclude-result-prefixes="#all">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Value Mapping using inline lookup tables (xsl:key + document fragment).
    Replaces SAP CPI Value Mapping iFlow step inline — useful for small,
    stable mappings you want to keep in the stylesheet itself.
  -->

  <!-- Inline lookup table as a variable -->
  <xsl:variable name="statusMap">
    <entry code="A" label="Active"    target="ACTIVE"/>
    <entry code="B" label="Blocked"   target="BLOCKED"/>
    <entry code="C" label="Closed"    target="CLOSED"/>
    <entry code="D" label="Deleted"   target="DELETED"/>
  </xsl:variable>

  <xsl:variable name="priorityMap">
    <entry code="1" label="Critical"  sla="4h"/>
    <entry code="2" label="High"      sla="8h"/>
    <entry code="3" label="Medium"    sla="24h"/>
    <entry code="4" label="Low"       sla="72h"/>
  </xsl:variable>

  <xsl:variable name="countryMap">
    <entry code="DE" name="Germany"        region="EMEA"/>
    <entry code="US" name="United States"  region="AMER"/>
    <entry code="GB" name="United Kingdom" region="EMEA"/>
    <entry code="JP" name="Japan"          region="APAC"/>
    <entry code="CN" name="China"          region="APAC"/>
  </xsl:variable>

  <xsl:template match="Orders">
    <EnrichedOrders>
      <xsl:apply-templates select="Order"/>
    </EnrichedOrders>
  </xsl:template>

  <xsl:template match="Order">
    <xsl:variable name="status"   select="$statusMap/entry[@code = current()/StatusCode]"/>
    <xsl:variable name="priority" select="$priorityMap/entry[@code = current()/PriorityCode]"/>
    <xsl:variable name="country"  select="$countryMap/entry[@code = current()/CountryCode]"/>

    <Order id="{Id}">
      <Status code="{StatusCode}" target="{$status/@target}">
        <xsl:value-of select="if ($status) then $status/@label else concat('UNKNOWN(', StatusCode, ')')"/>
      </Status>
      <Priority code="{PriorityCode}" sla="{$priority/@sla}">
        <xsl:value-of select="if ($priority) then $priority/@label else concat('UNKNOWN(', PriorityCode, ')')"/>
      </Priority>
      <Country code="{CountryCode}" region="{$country/@region}">
        <xsl:value-of select="if ($country) then $country/@name else concat('UNKNOWN(', CountryCode, ')')"/>
      </Country>
    </Order>
  </xsl:template>

</xsl:stylesheet>`
  },

  cpiHeaders: {
    label: 'Headers & Properties (CPI)',
    icon: '⚙️',
    desc: 'xsl:param binding + cpi:setHeader / setProperty',
    cat:  'cpi',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Products>
  <Product>
    <ProductId>P-001</ProductId>
    <Name>Hydraulic Pump</Name>
    <Category>Mechanical</Category>
    <Price>1450.00</Price>
    <CurrencyCode>EUR</CurrencyCode>
  </Product>
  <Product>
    <ProductId>P-002</ProductId>
    <Name>Control Valve</Name>
    <Category>Electrical</Category>
    <Price>320.00</Price>
    <CurrencyCode>EUR</CurrencyCode>
  </Product>
</Products>`,
    headers: [['orderid', 'PO-2024-42'], ['sourceSystem', 'SAP-ERP']],
    properties: [['quantity', '5'], ['processMode', 'PROD']],
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:cpi="http://sap.com/it/"
  exclude-result-prefixes="xs cpi">
  <xsl:output method="xml" indent="yes"/>

  <!--
    SAP CPI Headers & Properties demo.
    $exchange is the CPI exchange object — always declared but never used directly.
    cpi:setHeader / cpi:setProperty write to the message header/property map.
    Header params map to message headers; property params map to exchange properties.
  -->

  <xsl:param name="exchange"/>
  <xsl:param name="orderid"/>
  <xsl:param name="sourceSystem" select="'UNKNOWN'"/>
  <xsl:param name="quantity"     select="'1'"/>
  <xsl:param name="processMode"  select="'TEST'"/>

  <!-- Set output headers -->
  <xsl:value-of select="cpi:setHeader($exchange, 'content-type',      'application/xml')"/>
  <xsl:value-of select="cpi:setHeader($exchange, 'SAP_ApplicationID', $orderid)"/>
  <xsl:value-of select="cpi:setHeader($exchange, 'X-Source-System',   $sourceSystem)"/>

  <!-- Set exchange properties -->
  <xsl:value-of select="cpi:setProperty($exchange, 'processedBy',  'XSLTDebugX')"/>
  <xsl:value-of select="cpi:setProperty($exchange, 'processMode',  $processMode)"/>

  <xsl:template match="Products">
    <PurchaseOrder orderId="{$orderid}" mode="{$processMode}">
      <Items>
        <xsl:apply-templates select="Product"/>
      </Items>
      <TotalItems><xsl:value-of select="count(Product)"/></TotalItems>
    </PurchaseOrder>
  </xsl:template>

  <xsl:template match="Product">
    <Item>
      <ProductId><xsl:value-of select="ProductId"/></ProductId>
      <Name><xsl:value-of select="Name"/></Name>
      <Quantity><xsl:value-of select="$quantity"/></Quantity>
      <UnitPrice currency="{CurrencyCode}"><xsl:value-of select="Price"/></UnitPrice>
      <LineTotal currency="{CurrencyCode}">
        <xsl:value-of select="format-number(xs:decimal(Price) * xs:decimal($quantity), '#,##0.00')"/>
      </LineTotal>
    </Item>
  </xsl:template>

</xsl:stylesheet>`
  },

  errorHandling: {
    label: 'Error Handling (xsl:try)',
    icon: '🛡️',
    desc: 'Per-field try/catch with fallback — XSLT 3.0 resilience',
    cat:  'cpi',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Transactions>
  <Transaction>
    <Id>TXN-001</Id>
    <Amount>1250.75</Amount>
    <Date>2024-11-15</Date>
    <Type>CREDIT</Type>
  </Transaction>
  <Transaction>
    <Id>TXN-002</Id>
    <Amount>NOT_A_NUMBER</Amount>
    <Date>invalid-date</Date>
    <Type>DEBIT</Type>
  </Transaction>
  <Transaction>
    <Id>TXN-003</Id>
    <Amount>-500.00</Amount>
    <Date>2024-11-16</Date>
    <Type>UNKNOWN_TYPE</Type>
  </Transaction>
</Transactions>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:err="http://www.w3.org/2005/xqt-errors"
  exclude-result-prefixes="xs err">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Error handling with xsl:try / xsl:catch — XSLT 3.0 only.
    Each field is wrapped individually so one bad value doesn't
    fail the whole message. Critical for CPI resilience patterns.
  -->

  <xsl:template match="Transactions">
    <ProcessedTransactions>
      <xsl:apply-templates select="Transaction"/>
    </ProcessedTransactions>
  </xsl:template>

  <xsl:template match="Transaction">
    <Transaction id="{Id}">

      <!-- Safe decimal cast -->
      <Amount>
        <xsl:try>
          <xsl:variable name="amt" select="xs:decimal(Amount)"/>
          <xsl:attribute name="status">OK</xsl:attribute>
          <xsl:value-of select="format-number(abs($amt), '#,##0.00')"/>
          <xsl:catch errors="*">
            <xsl:attribute name="status">ERROR</xsl:attribute>
            <xsl:attribute name="error"><xsl:value-of select="$err:description"/></xsl:attribute>
            <xsl:value-of select="Amount"/>
          </xsl:catch>
        </xsl:try>
      </Amount>

      <!-- Safe date cast -->
      <Date>
        <xsl:try>
          <xsl:variable name="d" select="xs:date(Date)"/>
          <xsl:attribute name="status">OK</xsl:attribute>
          <xsl:value-of select="format-date($d, '[D01]-[MNn,3-3]-[Y0001]')"/>
          <xsl:catch errors="*">
            <xsl:attribute name="status">ERROR</xsl:attribute>
            <xsl:value-of select="Date"/>
          </xsl:catch>
        </xsl:try>
      </Date>

      <!-- Controlled vocabulary check -->
      <Type>
        <xsl:variable name="allowed" select="('CREDIT','DEBIT','TRANSFER','FEE')"/>
        <xsl:choose>
          <xsl:when test="Type = $allowed">
            <xsl:attribute name="valid">true</xsl:attribute>
            <xsl:value-of select="Type"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:attribute name="valid">false</xsl:attribute>
            <xsl:attribute name="error">Not in allowed values</xsl:attribute>
            <xsl:value-of select="Type"/>
          </xsl:otherwise>
        </xsl:choose>
      </Type>

    </Transaction>
  </xsl:template>

</xsl:stylesheet>`
  },

  batchProcessing: {
    label: 'Batch Processing (SuccessFactors)',
    icon: '🔄',
    desc: 'OData $batch for EmpEmployment + EmpJob UPSERT',
    cat:  'cpi',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<FormHeader>
  <FormHeader>
    <formSubjectId>user001</formSubjectId>
    <formTemplateId>PIP_TEMPLATE_01</formTemplateId>
    <creationDate>2024-11-15T09:00:00</creationDate>
    <formSubject>
      <User>
        <empInfo>
          <EmpEmployment>
            <personIdExternal>EXT-001</personIdExternal>
            <jobInfoNav>
              <EmpJob>
                <employeeClassNav>
                  <PicklistOption>
                    <externalCode>4</externalCode>
                  </PicklistOption>
                </employeeClassNav>
              </EmpJob>
            </jobInfoNav>
          </EmpEmployment>
        </empInfo>
      </User>
    </formSubject>
  </FormHeader>
  <FormHeader>
    <formSubjectId>user002</formSubjectId>
    <formTemplateId>CF_TEMPLATE_01</formTemplateId>
    <creationDate>2024-11-16T10:30:00</creationDate>
    <formSubject>
      <User>
        <empInfo>
          <EmpEmployment>
            <personIdExternal>EXT-002</personIdExternal>
            <jobInfoNav>
              <EmpJob>
                <employeeClassNav>
                  <PicklistOption>
                    <externalCode>4</externalCode>
                  </PicklistOption>
                </employeeClassNav>
              </EmpJob>
            </jobInfoNav>
          </EmpEmployment>
        </empInfo>
      </User>
    </formSubject>
  </FormHeader>
  <FormHeader>
    <formSubjectId>user003</formSubjectId>
    <formTemplateId>PIP_TEMPLATE_01</formTemplateId>
    <creationDate>2024-11-17T08:15:00</creationDate>
    <formSubject>
      <User>
        <empInfo>
          <EmpEmployment>
            <personIdExternal>EXT-003</personIdExternal>
            <jobInfoNav>
              <EmpJob>
                <employeeClassNav>
                  <PicklistOption>
                    <externalCode>3</externalCode>
                  </PicklistOption>
                </employeeClassNav>
              </EmpJob>
            </jobInfoNav>
          </EmpEmployment>
        </empInfo>
      </User>
    </formSubject>
  </FormHeader>
</FormHeader>`,
    headers: [['PIPFlag_OptionID', 'OPT_PIP_01'], ['CF_TemplateID', 'CF_TEMPLATE_01'], ['PIP_TemplateID', 'PIP_TEMPLATE_01']],
    properties: [['batchMode', 'UPSERT']],
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes" omit-xml-declaration="yes"/>

  <!--
    SAP SuccessFactors OData Batch Processing.
    Transforms performance form data into a $batch payload for
    EmpEmployment and EmpJob upsert operations.

    PIPFlag_OptionID — the option ID to stamp on PIP/CF forms
    PIP_TemplateID   — form template ID for PIP (Performance Improvement Plan)
    CF_TemplateID    — form template ID for Confirmation forms

    Only employees with employeeClass externalCode = '4' (probationary)
    receive an additional EmpJob batchChangeSetPart with probation end dates:
      PIP → +90 days from creation
      CF  → +30 days from creation
  -->

  <xsl:param name="PIPFlag_OptionID"/>
  <xsl:param name="CF_TemplateID"/>
  <xsl:param name="PIP_TemplateID"/>

  <xsl:template match="/FormHeader">
    <batchParts>
      <xsl:for-each select="FormHeader">
        <batchChangeSet>

          <!-- Always: upsert EmpEmployment with PIP/CF flag -->
          <batchChangeSetPart>
            <method>UPSERT</method>
            <EmpEmployment>
              <EmpEmployment>
                <personIdExternal>
                  <xsl:value-of select="formSubject/User/empInfo/EmpEmployment/personIdExternal"/>
                </personIdExternal>
                <userId><xsl:value-of select="formSubjectId"/></userId>
                <xsl:if test="formTemplateId = $PIP_TemplateID">
                  <customString34><xsl:value-of select="$PIPFlag_OptionID"/></customString34>
                </xsl:if>
                <xsl:if test="formTemplateId = $CF_TemplateID">
                  <customString35><xsl:value-of select="$PIPFlag_OptionID"/></customString35>
                </xsl:if>
              </EmpEmployment>
            </EmpEmployment>
          </batchChangeSetPart>

          <!-- Conditional: probationary employees (externalCode=4) get EmpJob update -->
          <xsl:if test="formSubject/User/empInfo/EmpEmployment/jobInfoNav/EmpJob/employeeClassNav/PicklistOption/externalCode = '4'">
            <batchChangeSetPart>
              <method>UPSERT</method>
              <EmpJob>
                <EmpJob>
                  <seqNumber>1</seqNumber>
                  <userId><xsl:value-of select="formSubjectId"/></userId>
                  <startDate><xsl:value-of select="creationDate"/></startDate>
                  <xsl:if test="formTemplateId = $PIP_TemplateID">
                    <probationPeriodEndDate>
                      <xsl:value-of select="xs:date(substring-before(creationDate, 'T')) + xs:dayTimeDuration('P90D')"/>
                    </probationPeriodEndDate>
                  </xsl:if>
                  <xsl:if test="formTemplateId = $CF_TemplateID">
                    <probationPeriodEndDate>
                      <xsl:value-of select="xs:date(substring-before(creationDate, 'T')) + xs:dayTimeDuration('P30D')"/>
                    </probationPeriodEndDate>
                  </xsl:if>
                  <eventReason>0909</eventReason>
                </EmpJob>
              </EmpJob>
            </batchChangeSetPart>
          </xsl:if>

        </batchChangeSet>
      </xsl:for-each>
    </batchParts>
  </xsl:template>

</xsl:stylesheet>`
  },

  multiCurrencyReport: {
    label: 'Multi-Currency Consolidation',
    icon: '💹',
    desc: 'Convert to base currency, group by currency code',
    cat:  'format',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Invoices baseCurrency="EUR">
  <Invoice>
    <Id>INV-001</Id><Vendor>Acme US</Vendor>
    <Amount>5000.00</Amount><Currency>USD</Currency><Rate>0.92</Rate>
  </Invoice>
  <Invoice>
    <Id>INV-002</Id><Vendor>Beta UK</Vendor>
    <Amount>3200.00</Amount><Currency>GBP</Currency><Rate>1.17</Rate>
  </Invoice>
  <Invoice>
    <Id>INV-003</Id><Vendor>Gamma DE</Vendor>
    <Amount>2800.00</Amount><Currency>EUR</Currency><Rate>1.00</Rate>
  </Invoice>
  <Invoice>
    <Id>INV-004</Id><Vendor>Delta JP</Vendor>
    <Amount>450000</Amount><Currency>JPY</Currency><Rate>0.0062</Rate>
  </Invoice>
</Invoices>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!--
    Multi-currency invoice consolidation.
    Converts all invoice amounts to base currency (EUR) using inline rates,
    then groups and sums by currency for a treasury report.
    Common in SAP CPI finance integration scenarios.
  -->

  <xsl:template match="Invoices">
    <xsl:variable name="baseCcy" select="@baseCurrency"/>
    <ConsolidatedReport baseCurrency="{$baseCcy}" generatedAt="{current-date()}">

      <InvoiceDetails>
        <xsl:for-each select="Invoice">
          <Invoice id="{Id}" vendor="{Vendor}">
            <OriginalAmount currency="{Currency}">
              <xsl:value-of select="format-number(xs:decimal(Amount), '#,##0.00')"/>
            </OriginalAmount>
            <BaseAmount currency="{$baseCcy}">
              <xsl:value-of select="format-number(xs:decimal(Amount) * xs:decimal(Rate), '#,##0.00')"/>
            </BaseAmount>
            <ExchangeRate><xsl:value-of select="Rate"/></ExchangeRate>
          </Invoice>
        </xsl:for-each>
      </InvoiceDetails>

      <CurrencyBreakdown>
        <xsl:for-each-group select="Invoice" group-by="Currency">
          <xsl:sort select="current-grouping-key()"/>
          <Group currency="{current-grouping-key()}" count="{count(current-group())}">
            <OriginalTotal>
              <xsl:value-of select="format-number(sum(current-group()/xs:decimal(Amount)), '#,##0.00')"/>
            </OriginalTotal>
            <BaseTotal currency="{$baseCcy}">
              <xsl:value-of select="format-number(sum(current-group()/(xs:decimal(Amount)*xs:decimal(Rate))), '#,##0.00')"/>
            </BaseTotal>
          </Group>
        </xsl:for-each-group>
      </CurrencyBreakdown>

      <GrandTotal currency="{$baseCcy}">
        <xsl:value-of select="format-number(sum(Invoice/(xs:decimal(Amount)*xs:decimal(Rate))), '#,##0.00')"/>
      </GrandTotal>

    </ConsolidatedReport>
  </xsl:template>

</xsl:stylesheet>`
  }
,

  batchKeyRecovery: {
    label: 'Batch Key Recovery (SuccessFactors)',
    icon: '🔑',
    desc: 'Re-inject saved keys into $batch response by position',
    cat:  'cpi',
    properties: [['Batch_Key', 'userId=20655282;userId=20654955']],
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<batchPartResponse>
  <batchChangeSetResponse>
    <batchChangeSetPartResponse>
      <headers>
        <Content-Length>753</Content-Length>
        <DataServiceVersion>1.0</DataServiceVersion>
        <Content-Type>application/atom+xml;charset=utf-8</Content-Type>
        <successfactors-message>successfactors-sourcetype is missing in request headers</successfactors-message>
      </headers>
      <statusInfo>OK</statusInfo>
      <contentId/>
      <body><UpsertResponses><EmpEmployment><key>EmpEmployment/personIdExternal=20655282,EmpEmployment/userId=20655282</key><status>OK</status><editStatus>UPSERTED</editStatus><message>[Warning!] This record was not saved because there were no new changes compared to the existing record.</message><index type="Edm.Int32">0</index><httpCode type="Edm.Int32">200</httpCode><inlineResults type="Bag(SFOData.UpsertResult)"/></EmpEmployment></UpsertResponses></body>
      <statusCode>200</statusCode>
    </batchChangeSetPartResponse>
  </batchChangeSetResponse>
  <batchChangeSetResponse>
    <batchChangeSetPartResponse>
      <headers>
        <Content-Length>753</Content-Length>
        <DataServiceVersion>1.0</DataServiceVersion>
        <Content-Type>application/atom+xml;charset=utf-8</Content-Type>
        <successfactors-message>successfactors-sourcetype is missing in request headers</successfactors-message>
      </headers>
      <statusInfo>OK</statusInfo>
      <contentId/>
      <body><UpsertResponses><EmpEmployment><key>EmpEmployment/personIdExternal=20654955,EmpEmployment/userId=20654955</key><status>OK</status><editStatus>UPSERTED</editStatus><message>[Warning!] This record was not saved because there were no new changes compared to the existing record.</message><index type="Edm.Int32">0</index><httpCode type="Edm.Int32">200</httpCode><inlineResults type="Bag(SFOData.UpsertResult)"/></EmpEmployment></UpsertResponses></body>
      <statusCode>200</statusCode>
    </batchChangeSetPartResponse>
  </batchChangeSetResponse>
</batchPartResponse>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes" omit-xml-declaration="yes"/>

  <!--
    SAP SuccessFactors Batch Key Recovery.

    PROBLEM: When a $batch request fails, the error response often omits the
    entity keys (personIdExternal / userId) making it impossible to know
    which records failed.

    SOLUTION: Before sending the $batch request, serialize the keys of all
    records into a semicolon-delimited string and save it as a CPI exchange
    property (Batch_Key). After receiving the response, this XSLT re-injects
    the keys back into each batchChangeSetResponse by position, so every
    response — success or failure — can be correlated to its source record.

    Property: Batch_Key = "userId=20655282;userId=20654955;..."
    Each token maps positionally to batchChangeSetResponse[n].
  -->

  <xsl:param name="Batch_Key"/>

  <xsl:template match="/batchPartResponse">
    <batchPartResponse>
      <xsl:for-each select="batchChangeSetResponse">
        <xsl:variable name="index"       select="position()"/>
        <xsl:variable name="keyFragment" select="tokenize($Batch_Key, ';')[$index]"/>
        <batchChangeSetResponse>
          <!-- Re-inject the saved key at the top of each changeset response -->
          <key>
            <xsl:value-of select="$keyFragment"/>
          </key>
          <!-- Pass through the full response body unchanged -->
          <xsl:copy-of select="batchChangeSetPartResponse"/>
        </batchChangeSetResponse>
      </xsl:for-each>
    </batchPartResponse>
  </xsl:template>

</xsl:stylesheet>`
  },

  xslMessageDebug: {
    label: 'xsl:message Debugging',
    icon: '🐛',
    desc: 'Use xsl:message as console.log — trace variables, loop counts and branch decisions',
    cat:  'cpi',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Orders>
  <Order id="ORD-001">
    <Customer>ACME Corp</Customer>
    <Total currency="USD">1250.00</Total>
    <Status>APPROVED</Status>
  </Order>
  <Order id="ORD-002">
    <Customer>Globex</Customer>
    <Total currency="EUR">340.00</Total>
    <Status>PENDING</Status>
  </Order>
  <Order id="ORD-003">
    <Customer>Initech</Customer>
    <Total currency="USD">89.50</Total>
    <Status>REJECTED</Status>
  </Order>
</Orders>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!--
    xsl:message Debugging — the XSLT equivalent of console.log.

    In SAP CPI there is no debugger and no variable inspector.
    xsl:message is your only way to trace what is happening at
    runtime. Messages appear in the CPI message monitor log,
    and here in XSLTDebugX they show up in the console panel
    as "xsl:message → ..." lines so you can inspect values
    without needing to deploy.

    Techniques demonstrated:
      1. Trace a variable value
      2. Log loop position and item count
      3. Log which branch of a choose was taken
      4. Trace a concat expression inline
      5. terminate="yes" to hard-stop on an unexpected condition
  -->

  <xsl:template match="/Orders">

    <!-- Technique 1: trace a document-level variable -->
    <xsl:variable name="orderCount" select="count(Order)"/>
    <xsl:message select="concat('DEBUG orderCount = ', $orderCount)"/>

    <ProcessedOrders>
      <xsl:apply-templates select="Order"/>
    </ProcessedOrders>
  </xsl:template>

  <xsl:template match="Order">

    <!-- Technique 2: trace loop position -->
    <xsl:message select="concat('DEBUG processing Order ', position(), ' of ', last(), ' — id=', @id)"/>

    <!-- Technique 3: trace which branch is taken -->
    <xsl:variable name="status" select="normalize-space(Status)"/>
    <xsl:choose>
      <xsl:when test="$status = 'APPROVED'">
        <xsl:message select="concat('DEBUG APPROVED branch — id=', @id)"/>
        <Order id="{@id}" action="SEND"/>
      </xsl:when>
      <xsl:when test="$status = 'PENDING'">
        <xsl:message select="concat('DEBUG PENDING branch — id=', @id, ' skipping')"/>
        <!-- intentionally omitted from output -->
      </xsl:when>
      <xsl:otherwise>
        <!-- Technique 5: hard-stop on truly unexpected status values -->
        <!-- Comment out terminate="yes" to continue past errors instead -->
        <xsl:message select="concat('WARN unknown status [', $status, '] for id=', @id)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>`
  }
,

  // ── XPATH EXAMPLES ───────────────────────────────────────────────

  xpathNavigation: {
    label: 'Navigation & Predicates',
    icon:  '🧭',
    desc:  'Select elements by name, attribute value, position and multi-condition predicates',
    cat:   'xpath',
    xpathExpr: "//Item[@status='active']",
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<SalesOrder>
  <Header>
    <OrderId>SO-2024-001</OrderId>
    <Customer>ACME Corp</Customer>
    <OrderDate>2024-03-15</OrderDate>
    <Currency>USD</Currency>
    <Status>OPEN</Status>
  </Header>
  <Items>
    <Item status="active">
      <LineNo>10</LineNo>
      <Material>MAT-001</Material>
      <Qty>5</Qty>
      <UnitPrice>120.00</UnitPrice>
      <Category>Pumps</Category>
    </Item>
    <Item status="cancelled">
      <LineNo>20</LineNo>
      <Material>MAT-002</Material>
      <Qty>3</Qty>
      <UnitPrice>85.50</UnitPrice>
      <Category>Valves</Category>
    </Item>
    <Item status="active">
      <LineNo>30</LineNo>
      <Material>MAT-003</Material>
      <Qty>10</Qty>
      <UnitPrice>45.00</UnitPrice>
      <Category>Pumps</Category>
    </Item>
    <Item status="active">
      <LineNo>40</LineNo>
      <Material>MAT-004</Material>
      <Qty>2</Qty>
      <UnitPrice>380.00</UnitPrice>
      <Category>Valves</Category>
    </Item>
  </Items>
</SalesOrder>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@* | node()">
    <xsl:copy><xsl:apply-templates select="@* | node()"/></xsl:copy>
  </xsl:template>
</xsl:stylesheet>`,
    xpathHints: [
      "//Item                                  — all Item elements",
      "//Item[@status='active']                — active items only",
      "//Item[@status='active' and Qty > 3]    — active with Qty > 3",
      "//Item[last()]                           — last item",
      "//Item[position() <= 2]                  — first two items",
      "//Item[Category='Pumps']/@status         — status attrs of Pumps",
    ]
  },

  xpathAggregation: {
    label: 'Aggregation Functions',
    icon:  '∑',
    desc:  'sum(), count(), max(), min(), avg() — essential for CPI payload inspection',
    cat:   'xpath',
    xpathExpr: "sum(//Item/(UnitPrice * Qty))",
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<PurchaseOrder id="PO-8821" currency="EUR">
  <Vendor>Siemens AG</Vendor>
  <Items>
    <Item>
      <LineNo>10</LineNo>
      <Material>SIE-CTRL-01</Material>
      <Qty>4</Qty>
      <UnitPrice>1250.00</UnitPrice>
      <Confirmed>true</Confirmed>
    </Item>
    <Item>
      <LineNo>20</LineNo>
      <Material>SIE-CABLE-5M</Material>
      <Qty>20</Qty>
      <UnitPrice>38.50</UnitPrice>
      <Confirmed>true</Confirmed>
    </Item>
    <Item>
      <LineNo>30</LineNo>
      <Material>SIE-RELAY-12V</Material>
      <Qty>10</Qty>
      <UnitPrice>95.00</UnitPrice>
      <Confirmed>false</Confirmed>
    </Item>
    <Item>
      <LineNo>40</LineNo>
      <Material>SIE-FUSE-32A</Material>
      <Qty>50</Qty>
      <UnitPrice>4.20</UnitPrice>
      <Confirmed>true</Confirmed>
    </Item>
  </Items>
</PurchaseOrder>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@* | node()">
    <xsl:copy><xsl:apply-templates select="@* | node()"/></xsl:copy>
  </xsl:template>
</xsl:stylesheet>`,
    xpathHints: [
      "count(//Item)                             — total line count",
      "count(//Item[Confirmed='true'])            — confirmed lines only",
      "sum(//Item/UnitPrice)                     — sum of unit prices",
      "max(//Item/UnitPrice)                     — most expensive item",
      "min(//Item/Qty)                           — smallest quantity",
      "avg(//Item/UnitPrice)                     — average unit price",
    ]
  },

  xpathStringFunctions: {
    label: 'String Functions',
    icon:  '🔤',
    desc:  'normalize-space, contains, starts-with, concat, upper-case, substring, string-length',
    cat:   'xpath',
    xpathExpr: "//Employee[contains(normalize-space(Name), 'Kumar')]",
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Employees system="SuccessFactors">
  <Employee>
    <EmpId>  SF-1001  </EmpId>
    <Name>Rahul Kumar</Name>
    <Email>rahul.kumar@acme.com</Email>
    <Department>IT Integration</Department>
    <Status>active</Status>
    <JoiningDate>2021-06-15</JoiningDate>
  </Employee>
  <Employee>
    <EmpId>SF-1002</EmpId>
    <Name>  Priya Sharma  </Name>
    <Email>priya.sharma@acme.com</Email>
    <Department>SAP Basis</Department>
    <Status>ACTIVE</Status>
    <JoiningDate>2019-03-01</JoiningDate>
  </Employee>
  <Employee>
    <EmpId>SF-1003</EmpId>
    <Name>Klaus Müller</Name>
    <Email>k.mueller@acme.de</Email>
    <Department>Finance</Department>
    <Status>inactive</Status>
    <JoiningDate>2018-11-20</JoiningDate>
  </Employee>
  <Employee>
    <EmpId>SF-1004</EmpId>
    <Name>Anita Kumar</Name>
    <Email>anita.kumar@acme.com</Email>
    <Department>IT Integration</Department>
    <Status>active</Status>
    <JoiningDate>2022-01-10</JoiningDate>
  </Employee>
</Employees>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@* | node()">
    <xsl:copy><xsl:apply-templates select="@* | node()"/></xsl:copy>
  </xsl:template>
</xsl:stylesheet>`,
    xpathHints: [
      "normalize-space(//Employee[1]/EmpId)                    — trim whitespace",
      "upper-case(//Employee[3]/Status)                        — normalise case",
      "//Employee[upper-case(Status)='ACTIVE']                 — case-insensitive filter",
      "//Employee[contains(Name,'Kumar')]                      — partial name match",
      "//Employee[starts-with(Email,'rahul')]                  — email prefix",
      "string-length(//Employee[1]/Name)                       — name length",
      "substring-before(//Employee[1]/Email,'@')               — local part of email",
      "concat(//Employee[1]/Name,' (',//Employee[1]/EmpId,')')  — build display label",
    ]
  },

  xpathTokenizeJoin: {
    label: 'tokenize() & string-join()',
    icon:  '🔗',
    desc:  'Split delimited CPI property strings and reassemble — common in batch and routing flows',
    cat:   'xpath',
    xpathExpr: "string-join(tokenize(//BatchKeys, ';'), ',')",
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<CPIContext>
  <!-- Semicolon-delimited keys saved before $batch call — typical CPI pattern -->
  <BatchKeys>userId=20655282;userId=20654955;userId=20651100;userId=20651101</BatchKeys>

  <!-- Comma-delimited routing categories from a CPI property -->
  <RoutingCategories>INVOICE,CREDIT_NOTE,DEBIT_NOTE,REVERSAL</RoutingCategories>

  <!-- Pipe-delimited error codes returned from downstream -->
  <ErrorCodes>DUPLICATE_KEY|MANDATORY_FIELD_MISSING|INVALID_DATE_FORMAT</ErrorCodes>

  <Records>
    <Record><Id>REC-001</Id><Tags>urgent,finance,eu</Tags></Record>
    <Record><Id>REC-002</Id><Tags>standard,hr</Tags></Record>
    <Record><Id>REC-003</Id><Tags>urgent,procurement</Tags></Record>
  </Records>
</CPIContext>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@* | node()">
    <xsl:copy><xsl:apply-templates select="@* | node()"/></xsl:copy>
  </xsl:template>
</xsl:stylesheet>`,
    xpathHints: [
      "tokenize(//BatchKeys, ';')                              — split on semicolon",
      "tokenize(//BatchKeys, ';')[2]                           — second token",
      "count(tokenize(//BatchKeys, ';'))                       — token count",
      "string-join(//Record/Id, ', ')                         — join element values",
      "string-join(tokenize(//RoutingCategories,',')[position()<=2],';') — slice & rejoin",
      "//Record[tokenize(Tags,',') = 'urgent']                — filter by tag in list",
    ]
  },

  xpathRegexReplace: {
    label: 'matches() & replace() — Regex',
    icon:  '⚡',
    desc:  'Validate and clean field values with XPath 2.0 regex — useful before CPI mapping',
    cat:   'xpath',
    xpathExpr: "replace(//Invoice[1]/VATNumber, '[^A-Z0-9]', '')",
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Invoices>
  <Invoice>
    <Id>INV-2024-001</Id>
    <Vendor>Bosch GmbH</Vendor>
    <VATNumber>DE 123 456 789</VATNumber>
    <Amount>  1,250.00  </Amount>
    <IBAN>DE89 3704 0044 0532 0130 00</IBAN>
    <Phone>+49 (0)89 1234-5678</Phone>
  </Invoice>
  <Invoice>
    <Id>INV-2024-002</Id>
    <Vendor>SAP SE</Vendor>
    <VATNumber>DE987654321</VATNumber>
    <Amount>8750.50</Amount>
    <IBAN>DE27 2004 1010 0504 0100 04</IBAN>
    <Phone>+49-6227-7-47474</Phone>
  </Invoice>
  <Invoice>
    <Id>INV-2024-003</Id>
    <Vendor>Invalid Corp</Vendor>
    <VATNumber>INVALID!</VATNumber>
    <Amount>not-a-number</Amount>
    <IBAN>GB29NWBK60161331926819</IBAN>
    <Phone>123</Phone>
  </Invoice>
</Invoices>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@* | node()">
    <xsl:copy><xsl:apply-templates select="@* | node()"/></xsl:copy>
  </xsl:template>
</xsl:stylesheet>`,
    xpathHints: [
      "replace(//Invoice[1]/VATNumber, '[^A-Z0-9]', '')       — strip non-alphanumeric",
      "replace(//Invoice[1]/IBAN, ' ', '')                     — strip spaces from IBAN",
      "replace(//Invoice[1]/Phone, '[^0-9+]', '')              — digits and + only",
      "matches(//Invoice[2]/VATNumber, '^DE[0-9]{9}$')         — validate German VAT",
      "matches(//Invoice[3]/Amount, '^[0-9]+(\.[0-9]+)?$')    — validate numeric",
      "//Invoice[matches(VATNumber, '^DE[0-9]{9}$')]           — filter valid VAT only",
    ]
  },

  xpathDateFunctions: {
    label: 'Date & Duration Functions',
    icon:  '📅',
    desc:  'Parse, format and compare xs:date values — critical for CPI SLA and deadline checks',
    cat:   'xpath',
    xpathExpr: "//Order[xs:date(DeliveryDate) lt current-date()]",
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Orders xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <Order>
    <Id>ORD-001</Id>
    <Customer>ACME Corp</Customer>
    <OrderDate>2024-01-10</OrderDate>
    <DeliveryDate>2024-01-25</DeliveryDate>
    <Status>DELIVERED</Status>
    <Amount>4500.00</Amount>
  </Order>
  <Order>
    <Id>ORD-002</Id>
    <Customer>Globex</Customer>
    <OrderDate>2024-03-01</OrderDate>
    <DeliveryDate>2027-06-30</DeliveryDate>
    <Status>PENDING</Status>
    <Amount>12000.00</Amount>
  </Order>
  <Order>
    <Id>ORD-003</Id>
    <Customer>Initech</Customer>
    <OrderDate>2024-02-14</OrderDate>
    <DeliveryDate>2027-12-31</DeliveryDate>
    <Status>PENDING</Status>
    <Amount>780.00</Amount>
  </Order>
</Orders>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@* | node()">
    <xsl:copy><xsl:apply-templates select="@* | node()"/></xsl:copy>
  </xsl:template>
</xsl:stylesheet>`,
    xpathHints: [
      "current-date()                                           — today's date",
      "current-dateTime()                                       — now with time",
      "//Order[xs:date(DeliveryDate) lt current-date()]        — overdue orders",
      "//Order[xs:date(DeliveryDate) gt current-date()]        — future deliveries",
      "xs:date(//Order[1]/DeliveryDate) - xs:date(//Order[1]/OrderDate) — duration",
      "format-date(xs:date(//Order[1]/OrderDate),'[D01]/[M01]/[Y0001]') — reformat date",
      "year-from-date(xs:date(//Order[1]/OrderDate))            — extract year",
      "month-from-date(xs:date(//Order[1]/OrderDate))           — extract month",
    ]
  },

  xpathNamespaceAgnostic: {
    label: 'Namespace-Agnostic Selection',
    icon:  '🏷️',
    desc:  'Use local-name() and *[local-name()] to query namespaced CPI payloads without prefix binding',
    cat:   'xpath',
    xpathExpr: "//*[local-name()='Amount']",
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<ns0:Invoice
  xmlns:ns0="http://sap.com/xi/AP/FI/Global"
  xmlns:ns1="http://sap.com/xi/AP/Common/Global"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ns0:Header>
    <ns1:InvoiceId>FI-2024-88721</ns1:InvoiceId>
    <ns1:PostingDate>2024-03-15</ns1:PostingDate>
    <ns0:CompanyCode>1000</ns0:CompanyCode>
    <ns0:Currency>EUR</ns0:Currency>
    <ns0:Amount>18750.00</ns0:Amount>
  </ns0:Header>
  <ns0:LineItems>
    <ns0:Item>
      <ns1:LineNo>1</ns1:LineNo>
      <ns1:GLAccount>400000</ns1:GLAccount>
      <ns0:Amount>12000.00</ns0:Amount>
      <ns0:CostCenter>CC-IT-01</ns0:CostCenter>
    </ns0:Item>
    <ns0:Item>
      <ns1:LineNo>2</ns1:LineNo>
      <ns1:GLAccount>470000</ns1:GLAccount>
      <ns0:Amount>6750.00</ns0:Amount>
      <ns0:CostCenter>CC-FIN-02</ns0:CostCenter>
    </ns0:Item>
  </ns0:LineItems>
</ns0:Invoice>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@* | node()">
    <xsl:copy><xsl:apply-templates select="@* | node()"/></xsl:copy>
  </xsl:template>
</xsl:stylesheet>`,
    xpathHints: [
      "//*[local-name()='Amount']                              — all Amount elements, any ns",
      "//*[local-name()='Item']                                — all Item elements",
      "//*[local-name()='Invoice']/*[local-name()='Header']    — Header child of Invoice",
      "string(//*[local-name()='InvoiceId'])                   — get ID value",
      "sum(//*[local-name()='Item']/*[local-name()='Amount'])  — sum line amounts",
      "namespace-uri(//*[local-name()='Amount'][1])            — inspect namespace URI",
    ]
  },

  xpathBatchErrorDetect: {
    label: 'Batch Error Detection',
    icon:  '🚨',
    desc:  'Identify failed changesets in SuccessFactors / OData $batch responses — real CPI pattern',
    cat:   'xpath',
    xpathExpr: "//batchChangeSetPartResponse[statusCode != '200']",
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<batchPartResponse>
  <batchChangeSetResponse>
    <batchChangeSetPartResponse>
      <statusInfo>OK</statusInfo>
      <statusCode>200</statusCode>
      <body>
        <UpsertResponses>
          <EmpEmployment>
            <key>userId=20655282</key>
            <status>OK</status>
            <editStatus>UPSERTED</editStatus>
          </EmpEmployment>
        </UpsertResponses>
      </body>
    </batchChangeSetPartResponse>
  </batchChangeSetResponse>
  <batchChangeSetResponse>
    <batchChangeSetPartResponse>
      <statusInfo>Bad Request</statusInfo>
      <statusCode>400</statusCode>
      <body>
        <error>
          <code>INVALID_FIELD_VALUE</code>
          <message>Field userId=20654955 contains an invalid value</message>
        </error>
      </body>
    </batchChangeSetPartResponse>
  </batchChangeSetResponse>
  <batchChangeSetResponse>
    <batchChangeSetPartResponse>
      <statusInfo>OK</statusInfo>
      <statusCode>200</statusCode>
      <body>
        <UpsertResponses>
          <EmpEmployment>
            <key>userId=20651100</key>
            <status>OK</status>
            <editStatus>UPSERTED</editStatus>
          </EmpEmployment>
        </UpsertResponses>
      </body>
    </batchChangeSetPartResponse>
  </batchChangeSetResponse>
  <batchChangeSetResponse>
    <batchChangeSetPartResponse>
      <statusInfo>Internal Server Error</statusInfo>
      <statusCode>500</statusCode>
      <body>
        <error>
          <code>SERVER_ERROR</code>
          <message>An unexpected error occurred processing userId=20651101</message>
        </error>
      </body>
    </batchChangeSetPartResponse>
  </batchChangeSetResponse>
</batchPartResponse>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@* | node()">
    <xsl:copy><xsl:apply-templates select="@* | node()"/></xsl:copy>
  </xsl:template>
</xsl:stylesheet>`,
    xpathHints: [
      "//batchChangeSetPartResponse[statusCode != '200']       — all failures",
      "//batchChangeSetPartResponse[statusCode = '400']        — bad requests only",
      "count(//batchChangeSetPartResponse[statusCode != '200']) — failure count",
      "count(//batchChangeSetPartResponse[statusCode = '200']) — success count",
      "//batchChangeSetPartResponse[statusCode != '200']/body/error/message — error msgs",
      "every $r in //batchChangeSetPartResponse satisfies $r/statusCode = '200' — all ok?",
    ]
  }


};