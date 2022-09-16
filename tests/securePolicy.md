<policymap xmlns="">
  <policy domain="resource" name="temporary-path" value="/mnt/magick-conversions-with-restrictive-permissions"/> <!-- the location should only be accessible to the low-privileged user running ImageMagick -->
  <policy domain="resource" name="memory" value="256MiB"/>
  <policy domain="resource" name="list-length" value="32"/>
  <policy domain="resource" name="width" value="8KP"/>
  <policy domain="resource" name="height" value="8KP"/>
  <policy domain="resource" name="map" value="512MiB"/>
  <policy domain="resource" name="area" value="16KP"/>
  <policy domain="resource" name="disk" value="1GiB"/>
  <policy domain="resource" name="file" value="768"/>
  <policy domain="resource" name="thread" value="2"/>
  <policy domain="resource" name="time" value="10"/>
  <policy domain="module" rights="none" pattern="*" /> 
  <policy domain="delegate" rights="none" pattern="*" />
  <policy domain="coder" rights="none" pattern="*" /> 
  <policy domain="coder" rights="write" pattern="{PNG,JPG,JPEG}" /> <!-- your restricted set of acceptable formats, set your rights needs -->
  <policy domain="filter" rights="none" pattern="*" />
  <policy domain="path" rights="none" pattern="@*"/>
  <policy domain="cache" name="memory-map" value="anonymous"/>
  <policy domain="cache" name="synchronize" value="true"/>
  <!-- <policy domain="cache" name="shared-secret" value="my-secret-passphrase" stealth="True"/> Only needed for distributed pixel cache spanning multiple servers -->
  <policy domain="system" name="shred" value="2"/>
  <policy domain="system" name="max-memory-request" value="256MiB"/>
  <policy domain="resource" name="throttle" value="1"/> <!-- Periodically yield the CPU for at least the time specified in ms -->
  <policy xmlns="" domain="system" name="precision" value="6"/>
</policymap>